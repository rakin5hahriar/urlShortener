const { nanoid } = require('nanoid');
const Url = require('../models/Url');

/**
 * Generate a unique short code
 * @param {number} length - Length of the short code
 * @returns {Promise<string>} - Unique short code
 */
const generateShortCode = async (length = 6) => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let shortCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    shortCode = nanoid(length).replace(/[_-]/g, () => 
      alphabet[Math.floor(Math.random() * alphabet.length)]
    );
    
    // Check if this short code already exists
    const existingUrl = await Url.findOne({ shortCode });
    if (!existingUrl) {
      isUnique = true;
    } else {
      attempts++;
      if (attempts < maxAttempts) {
        length++; // Increase length if collision occurs
      }
    }
  }

  if (!isUnique) {
    throw new Error('Unable to generate unique short code');
  }

  return shortCode;
};

/**
 * Validate custom alias
 * @param {string} alias - Custom alias to validate
 * @returns {Promise<boolean>} - Whether the alias is valid and available
 */
const validateCustomAlias = async (alias) => {
  if (!alias) return true; // Optional field

  // Check format
  const aliasRegex = /^[a-zA-Z0-9_-]+$/;
  if (!aliasRegex.test(alias)) {
    throw new Error('Custom alias can only contain letters, numbers, hyphens, and underscores');
  }

  // Check length
  if (alias.length < 3) {
    throw new Error('Custom alias must be at least 3 characters long');
  }

  if (alias.length > 50) {
    throw new Error('Custom alias cannot exceed 50 characters');
  }

  // Check if already exists
  const existingUrl = await Url.findOne({ 
    $or: [
      { shortCode: alias },
      { customAlias: alias }
    ]
  });

  if (existingUrl) {
    throw new Error('This alias is already taken');
  }

  // Check against reserved words
  const reservedWords = [
    'api', 'admin', 'www', 'mail', 'ftp', 'localhost',
    'dashboard', 'analytics', 'auth', 'login', 'register',
    'about', 'contact', 'help', 'support', 'terms', 'privacy',
    'health', 'status', 'docs', 'documentation'
  ];

  if (reservedWords.includes(alias.toLowerCase())) {
    throw new Error('This alias is reserved and cannot be used');
  }

  return true;
};

/**
 * Normalize URL by adding protocol if missing
 * @param {string} url - URL to normalize
 * @returns {string} - Normalized URL
 */
const normalizeUrl = (url) => {
  if (!url) return url;

  // Remove whitespace
  url = url.trim();

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
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
    return urlObj.hostname;
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Generate QR code data URL
 * @param {string} url - URL to generate QR code for
 * @returns {string} - QR code data URL
 */
const generateQRCode = async (url) => {
  // This would typically use a QR code library like 'qrcode'
  // For now, returning a placeholder
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
};

module.exports = {
  generateShortCode,
  validateCustomAlias,
  normalizeUrl,
  isValidUrl,
  extractDomain,
  generateQRCode
};
