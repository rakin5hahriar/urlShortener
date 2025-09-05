/**
 * User agent parsing and device/browser detection utility
 */

/**
 * Parse user agent string
 * @param {string} uaStr - User agent string
 * @returns {Object} - Parsed user agent info
 */
function parseUserAgent(uaStr) {
  if (!uaStr || typeof uaStr !== 'string') {
    return {
      browser: { name: 'Unknown', version: 'Unknown' },
      os: { name: 'Unknown', version: 'Unknown' },
      device: { type: 'unknown', brand: 'Unknown', model: 'Unknown' }
    };
  }

  const ua = uaStr.toLowerCase();
  return {
    browser: detectBrowser(ua),
    os: detectOS(ua),
    device: detectDevice(ua)
  };
}

function detectBrowser(ua) {
  if (ua.includes('chrome') && !ua.includes('edg')) return { name: 'Chrome', version: extractVersion(ua, /chrome\/([0-9.]+)/) };
  if (ua.includes('edg')) return { name: 'Edge', version: extractVersion(ua, /edg\/([0-9.]+)/) };
  if (ua.includes('firefox')) return { name: 'Firefox', version: extractVersion(ua, /firefox\/([0-9.]+)/) };
  if (ua.includes('safari') && !ua.includes('chrome')) return { name: 'Safari', version: extractVersion(ua, /version\/([0-9.]+)/) };
  if (ua.includes('opera') || ua.includes('opr')) return { name: 'Opera', version: extractVersion(ua, /(?:opera|opr)\/([0-9.]+)/) };
  if (ua.includes('msie') || ua.includes('trident')) return { name: 'Internet Explorer', version: extractVersion(ua, /(?:msie |rv:)([0-9.]+)/) };
  return { name: 'Unknown', version: 'Unknown' };
}

function detectOS(ua) {
  if (ua.includes('windows')) {
    if (ua.includes('windows nt 10.0')) return { name: 'Windows', version: '10' };
    if (ua.includes('windows nt 6.3')) return { name: 'Windows', version: '8.1' };
    if (ua.includes('windows nt 6.2')) return { name: 'Windows', version: '8' };
    if (ua.includes('windows nt 6.1')) return { name: 'Windows', version: '7' };
    return { name: 'Windows', version: 'Unknown' };
  }
  if (ua.includes('mac os x')) {
    const version = extractVersion(ua, /mac os x ([0-9_]+)/).replace(/_/g, '.');
    return { name: 'macOS', version };
  }
  if (ua.includes('linux')) {
    if (ua.includes('ubuntu')) return { name: 'Ubuntu', version: 'Unknown' };
    if (ua.includes('debian')) return { name: 'Debian', version: 'Unknown' };
    if (ua.includes('fedora')) return { name: 'Fedora', version: 'Unknown' };
    return { name: 'Linux', version: 'Unknown' };
  }
  if (ua.includes('android')) return { name: 'Android', version: extractVersion(ua, /android ([0-9.]+)/) };
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    const version = extractVersion(ua, /os ([0-9_]+)/).replace(/_/g, '.');
    return { name: 'iOS', version };
  }
  return { name: 'Unknown', version: 'Unknown' };
}

function detectDevice(ua) {
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    if (ua.includes('iphone')) return { type: 'mobile', brand: 'Apple', model: 'iPhone' };
    if (ua.includes('android')) {
      if (/samsung|galaxy|gt-|sm-/i.test(ua)) return { type: 'mobile', brand: 'Samsung', model: 'Android' };
      if (/huawei|honor/i.test(ua)) return { type: 'mobile', brand: 'Huawei', model: 'Android' };
      if (/xiaomi|mi |redmi/i.test(ua)) return { type: 'mobile', brand: 'Xiaomi', model: 'Android' };
      return { type: 'mobile', brand: 'Unknown', model: 'Android' };
    }
    return { type: 'mobile', brand: 'Unknown', model: 'Unknown' };
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    if (ua.includes('ipad')) return { type: 'tablet', brand: 'Apple', model: 'iPad' };
    return { type: 'tablet', brand: 'Unknown', model: 'Unknown' };
  }
  return { type: 'desktop', brand: 'Unknown', model: 'Unknown' };
}

function extractVersion(ua, regex) {
  const match = ua.match(regex);
  return match && match[1] ? match[1] : 'Unknown';
}

function isBot(userAgent) {
  if (!userAgent) return false;
  const bots = [/googlebot/i,/bingbot/i,/slurp/i,/duckduckbot/i,/baiduspider/i,/yandexbot/i,/facebookexternalhit/i,/twitterbot/i,/linkedinbot/i,/whatsapp/i,/telegram/i,/crawler/i,/spider/i,/bot/i,/headless/i,/phantom/i,/scraper/i];
  return bots.some(b => b.test(userAgent));
}

function getDeviceType(userAgent) {
  return parseUserAgent(userAgent).device.type;
}

module.exports = {
  parseUserAgent,
  detectBrowser,
  detectOS,
  detectDevice,
  isBot,
  getDeviceType
};
