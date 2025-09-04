const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: [true, 'URL reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous clicks
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    validate: {
      validator: function(ip) {
        // Basic IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === '::1' || ip === '127.0.0.1';
      },
      message: 'Invalid IP address format'
    }
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
    maxlength: [500, 'User agent cannot exceed 500 characters']
  },
  referer: {
    type: String,
    default: null,
    maxlength: [500, 'Referer cannot exceed 500 characters']
  },
  country: {
    type: String,
    default: 'Unknown',
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  city: {
    type: String,
    default: 'Unknown',
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  browser: {
    name: {
      type: String,
      default: 'Unknown',
      maxlength: [50, 'Browser name cannot exceed 50 characters']
    },
    version: {
      type: String,
      default: 'Unknown',
      maxlength: [20, 'Browser version cannot exceed 20 characters']
    }
  },
  os: {
    name: {
      type: String,
      default: 'Unknown',
      maxlength: [50, 'OS name cannot exceed 50 characters']
    },
    version: {
      type: String,
      default: 'Unknown',
      maxlength: [20, 'OS version cannot exceed 20 characters']
    }
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    brand: {
      type: String,
      default: 'Unknown',
      maxlength: [50, 'Device brand cannot exceed 50 characters']
    },
    model: {
      type: String,
      default: 'Unknown',
      maxlength: [50, 'Device model cannot exceed 50 characters']
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: false // We're using custom timestamp field
});

// Indexes for better query performance
clickSchema.index({ url: 1 });
clickSchema.index({ user: 1 });
clickSchema.index({ timestamp: -1 });
clickSchema.index({ ipAddress: 1 });
clickSchema.index({ 'browser.name': 1 });
clickSchema.index({ 'os.name': 1 });
clickSchema.index({ 'device.type': 1 });
clickSchema.index({ country: 1 });

// Static method to get analytics for a URL
clickSchema.statics.getAnalytics = async function(urlId, startDate, endDate) {
  const matchStage = { url: mongoose.Types.ObjectId(urlId) };
  
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const analytics = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalClicks: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$ipAddress' },
        countries: { $addToSet: '$country' },
        browsers: { $addToSet: '$browser.name' },
        operatingSystems: { $addToSet: '$os.name' },
        devices: { $addToSet: '$device.type' }
      }
    },
    {
      $project: {
        _id: 0,
        totalClicks: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        countries: { $size: '$countries' },
        browsers: { $size: '$browsers' },
        operatingSystems: { $size: '$operatingSystems' },
        devices: { $size: '$devices' }
      }
    }
  ]);

  return analytics[0] || {
    totalClicks: 0,
    uniqueVisitors: 0,
    countries: 0,
    browsers: 0,
    operatingSystems: 0,
    devices: 0
  };
};

module.exports = mongoose.model('Click', clickSchema);
