const express = require('express');
const {
  createShortUrl,
  getUserUrls,
  getUrlDetails,
  updateUrl,
  deleteUrl,
  redirectUrl,
  getUrlAnalytics
} = require('../controllers/url.controller');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public redirect route (must be first to catch short codes)
router.get('/:shortCode', redirectUrl);

// URL management routes
router.post('/', optionalAuth, createShortUrl); // Optional auth allows both authenticated and anonymous users
router.get('/', auth, getUserUrls); // Protected - get user's URLs
router.get('/:id/details', auth, getUrlDetails); // Protected - get specific URL details
router.put('/:id', auth, updateUrl); // Protected - update URL
router.delete('/:id', auth, deleteUrl); // Protected - delete URL
router.get('/:id/analytics', auth, getUrlAnalytics); // Protected - get URL analytics

module.exports = router;
