const { nanoid } = require('nanoid');
const validator = require('validator');
const Url = require('../models/Url');

/**
 * Generate a unique short code
 * @param {number} length - Length of the short code
 * @returns {Promise<string>} - Unique short code
 */
const generateShortCode = async (length = 8) => {
  let shortCode;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    shortCode = nanoid(length);
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique short code');
    }
    
    // Check if this short code already exists
    const existingUrl = await Url.findOne({
      $or: [
        { shortCode },
        { customAlias: shortCode }
      ]
    });
    
    if (!existingUrl) {
      break;
    }
  } while (true);

  return shortCode;
};

/**
 * Validate custom alias
 * @param {string} alias - Custom alias to validate
 * @returns {Promise<boolean>} - Whether the alias is valid and available
 */
const validateCustomAlias = async (alias) => {
  // Check format
  if (!alias || typeof alias !== 'string') {
    throw new Error('Custom alias is required');
  }

  // Check length
  if (alias.length < 3) {
    throw new Error('Custom alias must be at least 3 characters long');
  }

  if (alias.length > 50) {
    throw new Error('Custom alias cannot exceed 50 characters');
  }

  // Check pattern
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(alias)) {
    throw new Error('Custom alias can only contain letters, numbers, hyphens, and underscores');
  }

  // Check for reserved words
  const reservedWords = [
    'api', 'www', 'admin', 'root', 'user', 'app', 'dashboard', 'login', 'register',
    'signup', 'signin', 'logout', 'profile', 'settings', 'help', 'support', 'about',
    'contact', 'terms', 'privacy', 'legal', 'blog', 'news', 'home', 'index',
    'analytics', 'stats', 'reports', 'manage', 'create', 'edit', 'delete', 'remove',
    'add', 'new', 'update', 'view', 'preview', 'download', 'upload', 'share',
    'public', 'private', 'internal', 'external', 'test', 'demo', 'dev', 'prod',
    'staging', 'beta', 'alpha', 'v1', 'v2', 'version', 'health', 'status',
    'ping', 'robots', 'sitemap', 'favicon', 'asset', 'assets', 'static', 'css',
    'js', 'img', 'image', 'images', 'file', 'files', 'docs', 'doc', 'pdf'
  ];

  if (reservedWords.includes(alias.toLowerCase())) {
    throw new Error('This alias is reserved and cannot be used');
  }

  // Check availability in database
  const existingUrl = await Url.findOne({
    $or: [
      { shortCode: alias },
      { customAlias: alias }
    ]
  });

  if (existingUrl) {
    throw new Error('This alias is already taken');
  }

  return true;
};

/**
 * Normalize URL by adding protocol if missing
 * @param {string} url - URL to normalize
 * @returns {string} - Normalized URL
 */
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  let normalizedUrl = url.trim();

  // Add protocol if missing
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  return normalizedUrl;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    // Use validator.js for URL validation
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true,
      require_valid_protocol: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false,
      disallow_auth: false
    });
  } catch (error) {
    return false;
  }
};

/**
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} - Domain name
 */
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Generate QR code URL for a given URL
 * @param {string} url - URL to generate QR code for
 * @returns {Promise<string>} - QR code image URL
 */
const generateQRCode = async (url) => {
  if (!url) {
    return null;
  }

  // Using QR Server API as a simple solution
  const encodedUrl = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
};

module.exports = {
  generateShortCode,
  validateCustomAlias,
  normalizeUrl,
  isValidUrl,
  extractDomain,
  generateQRCode
};

module.exports = {
  generateShortCode,
  validateCustomAlias,
  normalizeUrl,
  isValidUrl,
  extractDomain,
  generateQRCode
};
