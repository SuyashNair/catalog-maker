const Category = require('../models/Category');

/**
 * GET /api/categories
 * Public - List all visible categories with product counts
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isVisible: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/categories/:slug
 * Public - Get single category
 */
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};
