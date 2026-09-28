const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  sku: { type: String, default: '' },
  price: { type: Number, default: 0 },
  compareAtPrice: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  options: { type: Map, of: String },
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  sku: {
    type: String,
    default: '',
    index: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  compareAtPrice: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  description: {
    type: String,
    default: '',
  },
  shortDescription: {
    type: String,
    default: '',
  },
  images: [{
    url: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    alt: { type: String, default: '' },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    index: true,
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  tags: [{ type: String }],
  inStock: {
    type: Boolean,
    default: true,
  },
  stockQuantity: {
    type: Number,
    default: -1, // -1 means untracked
  },
  variants: [variantSchema],
  // Source tracking
  source: {
    type: String,
    enum: ['manual', 'shopify', 'woocommerce', 'other'],
    default: 'manual',
  },
  sourceId: {
    type: String,
    default: '',
    index: true,
  },
  sourceUrl: {
    type: String,
    default: '',
  },
  sourceData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Metadata
  isVisible: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  lastSyncedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound indexes for fast queries
productSchema.index({ category: 1, isVisible: 1, displayOrder: 1 });
productSchema.index({ source: 1, sourceId: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ isVisible: 1, createdAt: -1 });
productSchema.index({ isFeatured: 1, isVisible: 1 });

module.exports = mongoose.model('Product', productSchema);
