/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip ||
         '127.0.0.1';
};

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} - Whether the IP address is valid
 */
const isValidIP = (ip) => {
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  // Special cases
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return true;
  }
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Anonymize IP address for privacy
 * @param {string} ip - IP address to anonymize
 * @returns {string} - Anonymized IP address
 */
const anonymizeIP = (ip) => {
  if (!ip || !isValidIP(ip)) {
    return 'unknown';
  }
  
  // For IPv4, replace last octet with 0
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }
  
  // For IPv6, replace last 64 bits with zeros
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      for (let i = Math.floor(parts.length / 2); i < parts.length; i++) {
        parts[i] = '0';
      }
      return parts.join(':');
    }
  }
  
  return ip;
};

/**
 * Get geolocation data from IP (mock implementation)
 * In a real application, you would use a service like MaxMind GeoIP
 * @param {string} ip - IP address
 * @returns {Object} - Geolocation data
 */
const getGeolocation = async (ip) => {
  // Mock implementation - in production, use a real geolocation service
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      country: 'Local',
      city: 'Local',
      region: 'Local',
      timezone: 'Local'
    };
  }
  
  // This is a placeholder - replace with actual geolocation service
  return {
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
    timezone: 'Unknown'
  };
};

/**
 * Check if IP is from a known bot or crawler
 * @param {string} ip - IP address
 * @param {string} userAgent - User agent string
 * @returns {boolean} - Whether the request is from a bot
 */
const isBot = (ip, userAgent) => {
  if (!userAgent) return false;
  
  const botPatterns = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegram/i,
    /crawler/i,
    /spider/i,
    /bot/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
};

module.exports = {
  getClientIP,
  isValidIP,
  anonymizeIP,
  getGeolocation,
  isBot
};
