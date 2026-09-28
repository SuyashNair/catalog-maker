const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

/**
 * GET /api/config
 * Public - Returns catalog configuration for the frontend
 */
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findById('global').lean();
    if (!settings) {
      settings = {
        catalogName: 'Catalog Maker',
        catalogDescription: 'Browse our premium product catalog',
        whatsappNumber: '919999999999',
        activeDesign: 'elegant',
        currency: 'INR',
        currencySymbol: '₹',
        primaryColor: '#c9a55a',
      };
    }

    // Return only public-safe fields
    res.json({
      success: true,
      data: {
        catalogName: settings.catalogName,
        catalogDescription: settings.catalogDescription,
        whatsappNumber: settings.whatsappNumber,
        whatsappMessage: settings.whatsappMessage,
        activeDesign: settings.activeDesign,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
