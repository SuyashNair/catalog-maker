const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Singleton pattern - only one settings doc
  _id: {
    type: String,
    default: 'global',
  },
  catalogName: {
    type: String,
    default: 'Catalog Maker',
  },
  catalogDescription: {
    type: String,
    default: 'Browse our product catalog',
  },
  whatsappNumber: {
    type: String,
    default: '919999999999',
  },
  whatsappMessage: {
    type: String,
    default: 'Hi, I am interested in the following products:\n{products}\nPlease share more details and pricing.',
  },
  activeDesign: {
    type: String,
    default: 'elegant',
    enum: ['elegant', 'vibrant'],
  },
  currency: {
    type: String,
    default: 'INR',
  },
  currencySymbol: {
    type: String,
    default: '₹',
  },
  logoUrl: {
    type: String,
    default: '',
  },
  primaryColor: {
    type: String,
    default: '#c9a55a',
  },
  // Shopify config
  shopify: {
    storeUrl: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    isConfigured: { type: Boolean, default: false },
  },
  // WooCommerce config
  woocommerce: {
    url: { type: String, default: '' },
    consumerKey: { type: String, default: '' },
    consumerSecret: { type: String, default: '' },
    isConfigured: { type: Boolean, default: false },
  },
  // Sync settings
  autoSync: {
    enabled: { type: Boolean, default: false },
    intervalMinutes: { type: Number, default: 60 },
    lastRun: { type: Date, default: null },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
