/**
 * Utility module for IP handling and bot detection
 */

const os = require('os');

/**
 * Retrieve client IP from request
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
function extractClientIP(req) {
  const xForwarded = req.headers['x-forwarded-for'];
  const xReal = req.headers['x-real-ip'];
  const cfIP = req.headers['cf-connecting-ip'];

  if (xForwarded) return xForwarded.split(',')[0].trim();
  if (xReal) return xReal;
  if (cfIP) return cfIP;

  return req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip || '127.0.0.1';
}

/**
 * Validate IPv4 and IPv6 addresses
 * @param {string} ip - IP address
 * @returns {boolean}
 */
function validateIP(ip) {
  if (!ip) return false;

  const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
  const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ['127.0.0.1', '::1', 'localhost'].includes(ip) || ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Anonymize IP for privacy
 * @param {string} ip - IP address
 * @returns {string}
 */
function maskIP(ip) {
  if (!validateIP(ip)) return 'unknown';

  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  }

  if (ip.includes(':')) {
    const parts = ip.split(':');
    const half = Math.floor(parts.length / 2);
    for (let i = half; i < parts.length; i++) parts[i] = '0';
    return parts.join(':');
  }

  return ip;
}

/**
 * Mock geolocation service
 * @param {string} ip
 * @returns {Promise<Object>} - Geolocation data
 */
async function locateIP(ip) {
  const localPrefixes = ['127.', '192.168.', '10.'];
  if (!ip || localPrefixes.some(p => ip.startsWith(p)) || ip === '::1') {
    return { country: 'Local', region: 'Local', city: 'Local', timezone: 'Local' };
  }
  return { country: 'Unknown', region: 'Unknown', city: 'Unknown', timezone: 'Unknown' };
}

/**
 * Detect bots from IP/user-agent
 * @param {string} ip
 * @param {string} ua - User-Agent header
 * @returns {boolean}
 */
function detectBot(ip, ua) {
  if (!ua) return false;

  const bots = [
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /baiduspider/i, /yandexbot/i, /facebookexternalhit/i,
    /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegram/i,
    /crawler/i, /spider/i, /bot/i
  ];

  return bots.some(b => b.test(ua));
}

module.exports = {
  extractClientIP,
  validateIP,
  maskIP,
  locateIP,
  detectBot
};
