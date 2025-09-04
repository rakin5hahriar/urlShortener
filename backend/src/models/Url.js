const mongoose = require('mongoose');
const validator = require('validator');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true,
    validate: {
      validator: function(url) {
        return validator.isURL(url, {
          protocols: ['http', 'https'],
          require_protocol: true
        });
      },
      message: 'Please provide a valid URL with http:// or https://'
    }
  },
  shortCode: {
    type: String,
    required: [true, 'Short code is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Short code must be at least 3 characters long'],
    maxlength: [20, 'Short code cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, hyphens, and underscores']
  },
  customAlias: {
    type: String,
    trim: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    minlength: [3, 'Custom alias must be at least 3 characters long'],
    maxlength: [50, 'Custom alias cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Custom alias can only contain letters, numbers, hyphens, and underscores']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous URL creation
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  clicks: {
    type: Number,
    default: 0,
    min: [0, 'Clicks cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null // null means no expiration
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  lastClickedAt: {
    type: Date,
    default: null
  },
  qrCodeGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.shortUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/${ret.shortCode}`;
      return ret;
    }
  }
});

// Indexes for better query performance
urlSchema.index({ shortCode: 1 });
urlSchema.index({ user: 1 });
urlSchema.index({ customAlias: 1 }, { sparse: true });
urlSchema.index({ createdAt: -1 });
urlSchema.index({ clicks: -1 });

// Virtual for short URL
urlSchema.virtual('shortUrl').get(function() {
  return `${process.env.CLIENT_URL || 'http://localhost:5173'}/${this.shortCode}`;
});

// Method to check if URL is expired
urlSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to increment clicks
urlSchema.methods.incrementClicks = async function() {
  this.clicks += 1;
  this.lastClickedAt = new Date();
  return await this.save();
};

// Static method to find active URLs
urlSchema.statics.findActive = function() {
  return this.find({
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

module.exports = mongoose.model('Url', urlSchema);
