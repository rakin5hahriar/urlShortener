/**
 * Parse user agent string to extract device and browser information
 * @param {string} userAgent - User agent string
 * @returns {Object} - Parsed user agent information
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent || typeof userAgent !== 'string') {
    return {
      browser: {
        name: 'Unknown',
        version: 'Unknown'
      },
      os: {
        name: 'Unknown',
        version: 'Unknown'
      },
      device: {
        type: 'unknown',
        brand: 'Unknown',
        model: 'Unknown'
      }
    };
  }

  const ua = userAgent.toLowerCase();
  
  return {
    browser: parseBrowser(ua),
    os: parseOS(ua),
    device: parseDevice(ua)
  };
};

/**
 * Parse browser information from user agent
 * @param {string} ua - Lowercase user agent string
 * @returns {Object} - Browser information
 */
const parseBrowser = (ua) => {
  // Chrome (must be before Safari as Chrome includes Safari in UA)
  if (ua.includes('chrome') && !ua.includes('edg')) {
    const version = extractVersion(ua, /chrome\/([0-9.]+)/);
    return { name: 'Chrome', version };
  }
  
  // Edge
  if (ua.includes('edg')) {
    const version = extractVersion(ua, /edg\/([0-9.]+)/);
    return { name: 'Edge', version };
  }
  
  // Firefox
  if (ua.includes('firefox')) {
    const version = extractVersion(ua, /firefox\/([0-9.]+)/);
    return { name: 'Firefox', version };
  }
  
  // Safari (must be after Chrome as Chrome includes Safari in UA)
  if (ua.includes('safari') && !ua.includes('chrome')) {
    const version = extractVersion(ua, /version\/([0-9.]+)/);
    return { name: 'Safari', version };
  }
  
  // Opera
  if (ua.includes('opera') || ua.includes('opr')) {
    const version = extractVersion(ua, /(?:opera|opr)\/([0-9.]+)/);
    return { name: 'Opera', version };
  }
  
  // Internet Explorer
  if (ua.includes('msie') || ua.includes('trident')) {
    const version = extractVersion(ua, /(?:msie |rv:)([0-9.]+)/);
    return { name: 'Internet Explorer', version };
  }
  
  return { name: 'Unknown', version: 'Unknown' };
};

/**
 * Parse operating system information from user agent
 * @param {string} ua - Lowercase user agent string
 * @returns {Object} - OS information
 */
const parseOS = (ua) => {
  // Windows
  if (ua.includes('windows')) {
    if (ua.includes('windows nt 10.0')) return { name: 'Windows', version: '10' };
    if (ua.includes('windows nt 6.3')) return { name: 'Windows', version: '8.1' };
    if (ua.includes('windows nt 6.2')) return { name: 'Windows', version: '8' };
    if (ua.includes('windows nt 6.1')) return { name: 'Windows', version: '7' };
    return { name: 'Windows', version: 'Unknown' };
  }
  
  // macOS
  if (ua.includes('mac os x')) {
    const version = extractVersion(ua, /mac os x ([0-9_]+)/);
    return { name: 'macOS', version: version.replace(/_/g, '.') };
  }
  
  // Linux
  if (ua.includes('linux')) {
    if (ua.includes('ubuntu')) return { name: 'Ubuntu', version: 'Unknown' };
    if (ua.includes('debian')) return { name: 'Debian', version: 'Unknown' };
    if (ua.includes('fedora')) return { name: 'Fedora', version: 'Unknown' };
    return { name: 'Linux', version: 'Unknown' };
  }
  
  // Android
  if (ua.includes('android')) {
    const version = extractVersion(ua, /android ([0-9.]+)/);
    return { name: 'Android', version };
  }
  
  // iOS
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    const version = extractVersion(ua, /os ([0-9_]+)/);
    return { name: 'iOS', version: version.replace(/_/g, '.') };
  }
  
  return { name: 'Unknown', version: 'Unknown' };
};

/**
 * Parse device information from user agent
 * @param {string} ua - Lowercase user agent string
 * @returns {Object} - Device information
 */
const parseDevice = (ua) => {
  // Mobile devices
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    if (ua.includes('iphone')) {
      return { type: 'mobile', brand: 'Apple', model: 'iPhone' };
    }
    if (ua.includes('android')) {
      // Try to extract device brand/model for Android
      const samsung = ua.match(/samsung|galaxy|gt-|sm-/);
      const huawei = ua.match(/huawei|honor/);
      const xiaomi = ua.match(/xiaomi|mi |redmi/);
      
      if (samsung) return { type: 'mobile', brand: 'Samsung', model: 'Android' };
      if (huawei) return { type: 'mobile', brand: 'Huawei', model: 'Android' };
      if (xiaomi) return { type: 'mobile', brand: 'Xiaomi', model: 'Android' };
      
      return { type: 'mobile', brand: 'Unknown', model: 'Android' };
    }
    return { type: 'mobile', brand: 'Unknown', model: 'Unknown' };
  }
  
  // Tablets
  if (ua.includes('tablet') || ua.includes('ipad')) {
    if (ua.includes('ipad')) {
      return { type: 'tablet', brand: 'Apple', model: 'iPad' };
    }
    return { type: 'tablet', brand: 'Unknown', model: 'Unknown' };
  }
  
  // Desktop
  return { type: 'desktop', brand: 'Unknown', model: 'Unknown' };
};

/**
 * Extract version number from user agent using regex
 * @param {string} ua - User agent string
 * @param {RegExp} regex - Regex to extract version
 * @returns {string} - Version string
 */
const extractVersion = (ua, regex) => {
  const match = ua.match(regex);
  return match && match[1] ? match[1] : 'Unknown';
};

/**
 * Check if user agent is from a bot or crawler
 * @param {string} userAgent - User agent string
 * @returns {boolean} - Whether the user agent is from a bot
 */
const isBot = (userAgent) => {
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
    /bot/i,
    /headless/i,
    /phantom/i,
    /scraper/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * Get a simplified device type for analytics
 * @param {string} userAgent - User agent string
 * @returns {string} - Simplified device type
 */
const getDeviceType = (userAgent) => {
  const parsed = parseUserAgent(userAgent);
  return parsed.device.type;
};

module.exports = {
  parseUserAgent,
  parseBrowser,
  parseOS,
  parseDevice,
  isBot,
  getDeviceType
};
