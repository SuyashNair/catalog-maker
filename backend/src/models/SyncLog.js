const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['shopify', 'woocommerce', 'other'],
    required: true,
  },
  type: {
    type: String,
    enum: ['import', 'sync'],
    required: true,
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'partial'],
    default: 'running',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  stats: {
    total: { type: Number, default: 0 },
    created: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  errors: [{
    productId: String,
    productName: String,
    error: String,
    timestamp: { type: Date, default: Date.now },
  }],
  triggeredBy: {
    type: String,
    default: 'manual', // 'manual' | 'scheduled'
  },
}, {
  timestamps: true,
});

syncLogSchema.index({ source: 1, createdAt: -1 });
syncLogSchema.index({ status: 1 });

module.exports = mongoose.model('SyncLog', syncLogSchema);
