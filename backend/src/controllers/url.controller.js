const Url = require('../models/Url');
const Click = require('../models/Click');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');
const { 
  generateShortCode, 
  validateCustomAlias, 
  normalizeUrl, 
  isValidUrl,
  extractDomain,
  generateQRCode
} = require('../utils/short');
const { getClientIP, getGeolocation } = require('../utils/ip');
const { parseUserAgent, isBot } = require('../utils/userAgent');

/**
 * @desc    Create a short URL
 * @route   POST /api/urls
 * @access  Public/Private (optional auth)
 */
const createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl, customAlias, title, description, tags, expiresAt } = req.body;

  // Validation
  if (!originalUrl) {
    return res.status(400).json({
      success: false,
      message: 'Original URL is required'
    });
  }

  // Normalize and validate URL
  const normalizedUrl = normalizeUrl(originalUrl.trim());
  
  if (!isValidUrl(normalizedUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid URL with http:// or https://'
    });
  }

  // Validate custom alias if provided
  if (customAlias) {
    try {
      await validateCustomAlias(customAlias.trim());
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Check if user already has this URL shortened
  if (req.user) {
    const existingUrl = await Url.findOne({
      originalUrl: normalizedUrl,
      user: req.user.id
    });

    if (existingUrl) {
      return res.status(200).json({
        success: true,
        message: 'URL already shortened',
        data: { url: existingUrl }
      });
    }
  }

  // Generate short code
  const shortCode = customAlias ? customAlias.trim() : await generateShortCode();

  // Validate expiration date
  let expirationDate = null;
  if (expiresAt) {
    expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiration date must be in the future'
      });
    }
  }

  // Create URL document
  const urlData = {
    originalUrl: normalizedUrl,
    shortCode,
    customAlias: customAlias ? customAlias.trim() : undefined,
    user: req.user ? req.user.id : undefined,
    title: title ? title.trim() : extractDomain(normalizedUrl),
    description: description ? description.trim() : undefined,
    tags: tags && Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(Boolean) : [],
    expiresAt: expirationDate
  };

  const url = await Url.create(urlData);

  // Update user's URL count if authenticated
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { urlsCount: 1 }
    });
  }

  // Generate QR code URL
  const qrCodeUrl = await generateQRCode(`${req.protocol}://${req.get('host')}/${shortCode}`);

  res.status(201).json({
    success: true,
    message: 'Short URL created successfully',
    data: {
      url: {
        ...url.toJSON(),
        qrCode: qrCodeUrl
      }
    }
  });
});

/**
 * @desc    Get user's URLs
 * @route   GET /api/urls
 * @access  Private
 */
const getUserUrls = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Build query
  const query = { user: req.user.id };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { originalUrl: { $regex: search, $options: 'i' } },
      { shortCode: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const [urls, total] = await Promise.all([
    Url.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Url.countDocuments(query)
  ]);

  // Add QR codes to URLs
  const urlsWithQR = await Promise.all(
    urls.map(async (url) => ({
      ...url,
      qrCode: await generateQRCode(`${req.protocol}://${req.get('host')}/${url.shortCode}`)
    }))
  );

  res.status(200).json({
    success: true,
    data: {
      urls: urlsWithQR,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

/**
 * @desc    Get URL details
 * @route   GET /api/urls/:id
 * @access  Private
 */
const getUrlDetails = asyncHandler(async (req, res) => {
  const url = await Url.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!url) {
    return res.status(404).json({
      success: false,
      message: 'URL not found'
    });
  }

  // Generate QR code
  const qrCodeUrl = await generateQRCode(`${req.protocol}://${req.get('host')}/${url.shortCode}`);

  res.status(200).json({
    success: true,
    data: {
      url: {
        ...url.toJSON(),
        qrCode: qrCodeUrl
      }
    }
  });
});

/**
 * @desc    Update URL
 * @route   PUT /api/urls/:id
 * @access  Private
 */
const updateUrl = asyncHandler(async (req, res) => {
  const { title, description, tags, isActive, expiresAt } = req.body;

  const url = await Url.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!url) {
    return res.status(404).json({
      success: false,
      message: 'URL not found'
    });
  }

  // Update fields
  if (title !== undefined) url.title = title.trim();
  if (description !== undefined) url.description = description.trim();
  if (tags !== undefined) url.tags = Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(Boolean) : [];
  if (isActive !== undefined) url.isActive = Boolean(isActive);
  
  if (expiresAt !== undefined) {
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      if (expirationDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Expiration date must be in the future'
        });
      }
      url.expiresAt = expirationDate;
    } else {
      url.expiresAt = null;
    }
  }

  await url.save();

  res.status(200).json({
    success: true,
    message: 'URL updated successfully',
    data: { url }
  });
});

/**
 * @desc    Delete URL
 * @route   DELETE /api/urls/:id
 * @access  Private
 */
const deleteUrl = asyncHandler(async (req, res) => {
  const url = await Url.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!url) {
    return res.status(404).json({
      success: false,
      message: 'URL not found'
    });
  }

  // Delete associated clicks
  await Click.deleteMany({ url: url._id });

  // Delete URL
  await Url.findByIdAndDelete(url._id);

  // Update user's URL count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { urlsCount: -1, totalClicks: -url.clicks }
  });

  res.status(200).json({
    success: true,
    message: 'URL deleted successfully'
  });
});

/**
 * @desc    Redirect to original URL
 * @route   GET /:shortCode
 * @access  Public
 */
const redirectUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  // Find URL by short code or custom alias
  const url = await Url.findOne({
    $or: [
      { shortCode },
      { customAlias: shortCode }
    ],
    isActive: true
  });

  if (!url) {
    return res.status(404).json({
      success: false,
      message: 'Short URL not found'
    });
  }

  // Check if URL is expired
  if (url.isExpired()) {
    return res.status(410).json({
      success: false,
      message: 'Short URL has expired'
    });
  }

  // Get client information
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers.referer || req.headers.referrer || null;

  // Check if it's a bot (optional: don't count bot clicks)
  const isBotRequest = isBot(userAgent);

  if (!isBotRequest) {
    // Parse user agent
    const parsedUA = parseUserAgent(userAgent);
    const geolocation = await getGeolocation(clientIP);

    // Create click record
    const clickData = {
      url: url._id,
      user: req.user ? req.user.id : undefined,
      ipAddress: clientIP,
      userAgent,
      referer,
      country: geolocation.country,
      city: geolocation.city,
      browser: parsedUA.browser,
      os: parsedUA.os,
      device: parsedUA.device,
      timestamp: new Date()
    };

    await Click.create(clickData);

    // Increment URL clicks
    await url.incrementClicks();

    // Update user's total clicks if URL belongs to a user
    if (url.user) {
      await User.findByIdAndUpdate(url.user, {
        $inc: { totalClicks: 1 }
      });
    }
  }

  // Redirect to original URL
  res.redirect(301, url.originalUrl);
});

/**
 * @desc    Get URL analytics
 * @route   GET /api/urls/:id/analytics
 * @access  Private
 */
const getUrlAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = '7d' } = req.query;

  const url = await Url.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!url) {
    return res.status(404).json({
      success: false,
      message: 'URL not found'
    });
  }

  // Calculate date range
  let start, end;
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    end = new Date();
    switch (period) {
      case '24h':
        start = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  // Get analytics data
  const [
    totalStats,
    clicksByDate,
    clicksByCountry,
    clicksByBrowser,
    clicksByOS,
    clicksByDevice,
    recentClicks
  ] = await Promise.all([
    // Total statistics
    Click.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      }
    ]),

    // Clicks by date
    Click.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 100 }
    ]),

    // Top countries
    Click.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$country',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]),

    // Top browsers
    Click.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$browser.name',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]),

    // Top operating systems
    Click.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$os.name',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]),

    // Device types
    Click.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$device.type',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } }
    ]),

    // Recent clicks
    Click.find({
      url: url._id,
      timestamp: { $gte: start, $lte: end }
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('timestamp ipAddress country city browser.name os.name device.type')
  ]);

  const analytics = {
    url: {
      id: url._id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      title: url.title,
      totalClicks: url.clicks,
      createdAt: url.createdAt
    },
    period: {
      start,
      end,
      period
    },
    summary: totalStats[0] || { totalClicks: 0, uniqueVisitors: 0 },
    charts: {
      clicksByDate: clicksByDate.map(item => ({
        date: item._id,
        clicks: item.clicks
      })),
      clicksByCountry: clicksByCountry.map(item => ({
        country: item._id,
        clicks: item.clicks
      })),
      clicksByBrowser: clicksByBrowser.map(item => ({
        browser: item._id,
        clicks: item.clicks
      })),
      clicksByOS: clicksByOS.map(item => ({
        os: item._id,
        clicks: item.clicks
      })),
      clicksByDevice: clicksByDevice.map(item => ({
        device: item._id,
        clicks: item.clicks
      }))
    },
    recentClicks: recentClicks.map(click => ({
      timestamp: click.timestamp,
      location: `${click.city}, ${click.country}`,
      browser: click.browser.name,
      os: click.os.name,
      device: click.device.type
    }))
  };

  res.status(200).json({
    success: true,
    data: { analytics }
  });
});

module.exports = {
  createShortUrl,
  getUserUrls,
  getUrlDetails,
  updateUrl,
  deleteUrl,
  redirectUrl,
  getUrlAnalytics
};
