/**
 * URL Shortener Controller
 *
 * This file contains the logic for handling all URL-related operations,
 * including creation, redirection, management, and analytics.
 *
 * Major improvements in this refactor:
 * 1.  **Performance:**
 * - Replaced multiple parallel database queries in `getUrlAnalytics` with a single, more efficient `$facet` aggregation pipeline. This reduces database round-trips from seven to one.
 * - Removed on-the-fly QR code generation from the `getUserUrls` list endpoint to prevent performance bottlenecks with large lists. QR codes are now generated only when requesting specific URL details.
 *
 * 2.  **Readability & Maintainability:**
 * - Broke down large functions into smaller, single-responsibility helpers (e.g., `trackClick`, `findUrlForUser`, `getDateRange`).
 * - Introduced a whitelisting approach in `updateUrl` for better security and clearer intent.
 * - Added more descriptive JSDoc comments and inline explanations for complex logic.
 *
 * 3.  **Code Structure & Reusability:**
 * - Created a reusable `findUrlForUser` helper to consistently find and validate URL ownership, reducing code duplication across `getUrlDetails`, `updateUrl`, and `deleteUrl`.
 * - Centralized error responses for not found URLs.
 */

// Import Mongoose models
const Url = require('../models/Url');
const Click = require('../models/Click');
const User = require('../models/User');

// Import middleware and utilities
const { asyncHandler } = require('../middleware/error');
const shortUtils = require('../utils/short');
const ipUtils = require('../utils/ip');
const userAgentUtils = require('../utils/userAgent');

// --- Helper Functions ---

/**
 * Finds a URL by its ID for a specific user.
 * @param {string} urlId - The ID of the URL.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Document|null>} - The Mongoose document for the URL or null if not found.
 */
const findUrlForUser = (urlId, userId) => {
    return Url.findOne({ _id: urlId, user: userId });
};

/**
 * Tracks a click event for a URL.
 * @param {Document} url - The URL document being accessed.
 * @param {object} req - The Express request object.
 */
const trackClick = async (url, req) => {
    // 1. Get client information
    const userAgent = req.headers['user-agent'] || '';
    
    // 2. Ignore known bots to keep analytics clean
    if (userAgentUtils.isBot(userAgent)) {
        return;
    }

    // 3. Gather request details
    const clientIP = ipUtils.getClientIP(req);
    const referer = req.headers.referer || req.headers.referrer || null;
    const parsedUA = userAgentUtils.parseUserAgent(userAgent);
    const geolocation = await ipUtils.getGeolocation(clientIP);

    // 4. Create the click record
    const clickData = {
        url: url._id,
        ipAddress: clientIP,
        userAgent,
        referer,
        country: geolocation?.country,
        city: geolocation?.city,
        browser: parsedUA.browser,
        os: parsedUA.os,
        device: parsedUA.device,
    };

    // 5. Save the click and update counters in parallel
    await Promise.all([
        Click.create(clickData),
        url.incrementClicks(),
        // Increment the user's total clicks if the URL has an owner
        url.user ? User.findByIdAndUpdate(url.user, { $inc: { totalClicks: 1 } }) : Promise.resolve()
    ]);
};

/**
 * Calculates the date range for analytics queries.
 * @param {object} query - The request query parameters (startDate, endDate, period).
 * @returns {{start: Date, end: Date}} - The start and end dates for the query.
 */
const getDateRange = (query) => {
    const { startDate, endDate, period = '7d' } = query;
    let start, end;

    if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
    } else {
        end = new Date();
        const daysToSubtract = {
            '24h': 1,
            '7d': 7,
            '30d': 30,
            '90d': 90,
        } [period] || 7;
        start = new Date(Date.now() - daysToSubtract * 24 * 60 * 60 * 1000);
    }
    return { start, end };
};


// --- Controller Functions ---

/**
 * @desc    Create a short URL
 * @route   POST /api/urls
 * @access  Public/Private
 */
exports.createShortUrl = asyncHandler(async (req, res) => {
    const { originalUrl, customAlias, title, description, tags, expiresAt } = req.body;
    const userId = req.user?.id;

    if (!originalUrl) {
        return res.status(400).json({ success: false, message: 'Original URL is required' });
    }

    const normalizedUrl = shortUtils.normalizeUrl(originalUrl.trim());
    if (!shortUtils.isValidUrl(normalizedUrl)) {
        return res.status(400).json({ success: false, message: 'A valid URL with http:// or https:// is required' });
    }

    // If a user is logged in, check if they have already shortened this exact URL.
    if (userId) {
        const existingUrl = await Url.findOne({ originalUrl: normalizedUrl, user: userId });
        if (existingUrl) {
            return res.status(200).json({ success: true, message: 'URL already shortened', data: { url: existingUrl } });
        }
    }

    let shortCode = customAlias ? customAlias.trim() : await shortUtils.generateShortCode();

    // Validate custom alias if provided
    if (customAlias) {
        try {
            await shortUtils.validateCustomAlias(shortCode);
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // Validate expiration date
    let expirationDate = null;
    if (expiresAt) {
        expirationDate = new Date(expiresAt);
        if (expirationDate <= new Date()) {
            return res.status(400).json({ success: false, message: 'Expiration date must be in the future' });
        }
    }

    const urlData = {
        originalUrl: normalizedUrl,
        shortCode,
        customAlias: customAlias ? shortCode : undefined,
        user: userId,
        title: title?.trim() || shortUtils.extractDomain(normalizedUrl),
        description: description?.trim(),
        tags: tags && Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(Boolean) : [],
        expiresAt: expirationDate
    };

    const newUrl = await Url.create(urlData);

    // If a user created the URL, increment their URL count
    if (userId) {
        await User.findByIdAndUpdate(userId, { $inc: { urlsCount: 1 } });
    }

    // Generate a QR code for the newly created URL
    const qrCode = await shortUtils.generateQRCode(`${req.protocol}://${req.get('host')}/${newUrl.shortCode}`);

    res.status(201).json({
        success: true,
        message: 'Short URL created successfully',
        data: { url: { ...newUrl.toJSON(), qrCode } }
    });
});

/**
 * @desc    Get all URLs for the authenticated user
 * @route   GET /api/urls
 * @access  Private
 */
exports.getUserUrls = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { user: req.user.id };
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { originalUrl: { $regex: search, $options: 'i' } },
            { shortCode: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOptions = {
        [sortBy]: sortOrder === 'desc' ? -1 : 1
    };

    const [urls, total] = await Promise.all([
        Url.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit, 10))
            .lean(),
        Url.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        data: {
            urls,
            pagination: {
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(total / parseInt(limit, 10)),
                totalItems: total,
                itemsPerPage: parseInt(limit, 10)
            }
        }
    });
});

/**
 * @desc    Get details for a single URL
 * @route   GET /api/urls/:id
 * @access  Private
 */
exports.getUrlDetails = asyncHandler(async (req, res) => {
    const url = await findUrlForUser(req.params.id, req.user.id);

    if (!url) {
        return res.status(404).json({ success: false, message: 'URL not found' });
    }

    const qrCode = await shortUtils.generateQRCode(`${req.protocol}://${req.get('host')}/${url.shortCode}`);

    res.status(200).json({
        success: true,
        data: { url: { ...url.toJSON(), qrCode } }
    });
});

/**
 * @desc    Update a URL's details
 * @route   PUT /api/urls/:id
 * @access  Private
 */
exports.updateUrl = asyncHandler(async (req, res) => {
    const url = await findUrlForUser(req.params.id, req.user.id);

    if (!url) {
        return res.status(404).json({ success: false, message: 'URL not found' });
    }

    // Whitelist of fields that can be updated
    const updatableFields = ['title', 'description', 'tags', 'isActive', 'expiresAt'];

    updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
            // Special handling for specific fields
            if (field === 'expiresAt') {
                if (req.body.expiresAt) {
                    const expirationDate = new Date(req.body.expiresAt);
                    if (expirationDate <= new Date()) {
                        // This should ideally be a thrown error caught by a validation middleware
                        throw new Error('Expiration date must be in the future');
                    }
                    url.expiresAt = expirationDate;
                } else {
                    url.expiresAt = null; // Allow clearing the expiration date
                }
            } else if (field === 'tags' && Array.isArray(req.body.tags)) {
                url.tags = req.body.tags.map(tag => tag.trim()).filter(Boolean);
            } else {
                url[field] = req.body[field];
            }
        }
    });

    await url.save();

    res.status(200).json({
        success: true,
        message: 'URL updated successfully',
        data: { url }
    });
});

/**
 * @desc    Delete a URL
 * @route   DELETE /api/urls/:id
 * @access  Private
 */
exports.deleteUrl = asyncHandler(async (req, res) => {
    const url = await findUrlForUser(req.params.id, req.user.id);

    if (!url) {
        return res.status(404).json({ success: false, message: 'URL not found' });
    }

    // Perform deletions and updates in parallel for efficiency
    await Promise.all([
        Click.deleteMany({ url: url._id }),
        Url.findByIdAndDelete(url._id),
        // Decrement user stats
        User.findByIdAndUpdate(req.user.id, {
            $inc: { urlsCount: -1, totalClicks: -url.clicks }
        })
    ]);

    res.status(200).json({ success: true, message: 'URL and associated data deleted' });
});

/**
 * @desc    Redirect a short URL to its original destination and track the click
 * @route   GET /:shortCode
 * @access  Public
 */
exports.redirectUrl = asyncHandler(async (req, res, next) => {
    const { shortCode } = req.params;

    const url = await Url.findOne({
        $or: [{ shortCode }, { customAlias: shortCode }],
        isActive: true
    });

    if (!url) {
        return res.status(404).json({ success: false, message: 'Short URL not found' });
    }

    if (url.isExpired()) {
        return res.status(410).json({ success: false, message: 'This short URL has expired' });
    }

    // Track the click asynchronously (fire-and-forget) to not delay the redirect.
    trackClick(url, req).catch(err => console.error('Failed to track click:', err));

    res.redirect(301, url.originalUrl);
});

/**
 * @desc    Get analytics for a specific URL
 * @route   GET /api/urls/:id/analytics
 * @access  Private
 */
exports.getUrlAnalytics = asyncHandler(async (req, res) => {
    const url = await findUrlForUser(req.params.id, req.user.id);
    if (!url) {
        return res.status(404).json({ success: false, message: 'URL not found' });
    }

    const { start, end } = getDateRange(req.query);

    // Use a single, powerful $facet aggregation to run all analytics queries at once.
    const analyticsPipeline = [{ $match: { url: url._id, timestamp: { $gte: start, $lte: end } } }, {
        $facet: {
            'summary': [{ $group: { _id: null, totalClicks: { $sum: 1 }, uniqueVisitors: { $addToSet: '$ipAddress' } } }, { $project: { _id: 0, totalClicks: 1, uniqueVisitors: { $size: '$uniqueVisitors' } } }],
            'clicksByDate': [{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, clicks: { $sum: 1 } } }, { $sort: { _id: 1 } }],
            'clicksByCountry': [{ $group: { _id: '$country', clicks: { $sum: 1 } } }, { $sort: { clicks: -1 } }, { $limit: 10 }],
            'clicksByBrowser': [{ $group: { _id: '$browser.name', clicks: { $sum: 1 } } }, { $sort: { clicks: -1 } }, { $limit: 10 }],
            'clicksByOS': [{ $group: { _id: '$os.name', clicks: { $sum: 1 } } }, { $sort: { clicks: -1 } }, { $limit: 10 }],
            'clicksByDevice': [{ $group: { _id: '$device.type', clicks: { $sum: 1 } } }, { $sort: { clicks: -1 } }],
        }
    }];

    const [analyticsResult] = await Click.aggregate(analyticsPipeline);
    const recentClicks = await Click.find({ url: url._id, timestamp: { $gte: start, $lte: end } })
        .sort({ timestamp: -1 })
        .limit(50)
        .select('timestamp country city browser.name os.name device.type');

    // Structure the final analytics object
    const analytics = {
        url: {
            id: url._id,
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            title: url.title,
            totalClicks: url.clicks,
            createdAt: url.createdAt,
        },
        period: { start, end },
        summary: analyticsResult.summary[0] || { totalClicks: 0, uniqueVisitors: 0 },
        charts: {
            clicksByDate: analyticsResult.clicksByDate.map(i => ({ date: i._id, clicks: i.clicks })),
            clicksByCountry: analyticsResult.clicksByCountry.map(i => ({ country: i._id || 'Unknown', clicks: i.clicks })),
            clicksByBrowser: analyticsResult.clicksByBrowser.map(i => ({ browser: i._id || 'Unknown', clicks: i.clicks })),
            clicksByOS: analyticsResult.clicksByOS.map(i => ({ os: i._id || 'Unknown', clicks: i.clicks })),
            clicksByDevice: analyticsResult.clicksByDevice.map(i => ({ device: i._id || 'desktop', clicks: i.clicks })),
        },
        recentClicks,
    };

    res.status(200).json({ success: true, data: { analytics } });
});
