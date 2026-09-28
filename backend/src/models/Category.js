const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  productCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

categorySchema.index({ slug: 1 });
categorySchema.index({ isVisible: 1, displayOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
