const Product = require('../models/Product');
const Category = require('../models/Category');
const SyncLog = require('../models/SyncLog');
const Settings = require('../models/Settings');
const SyncEngine = require('../services/syncEngine');

// ──────────── PRODUCTS (Admin) ────────────

exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, search, source, category } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (source) query.source = source;
    if (category) query.category = category;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({ success: true, data: products, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
    const product = await Product.create({ ...req.body, slug, source: 'manual' });
    // Update category count
    if (product.category) {
      const count = await Product.countDocuments({ category: product.category, isVisible: true });
      await Category.findByIdAndUpdate(product.category, { productCount: count });
    }
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    // Update category count
    if (product.category) {
      const count = await Product.countDocuments({ category: product.category, isVisible: true });
      await Category.findByIdAndUpdate(product.category, { productCount: count });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};

// ──────────── CATEGORIES (Admin) ────────────

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = await Category.create({ ...req.body, slug });
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

exports.reorderCategories = async (req, res, next) => {
  try {
    const { order } = req.body; // [{id, displayOrder}]
    for (const item of order) {
      await Category.findByIdAndUpdate(item.id, { displayOrder: item.displayOrder });
    }
    res.json({ success: true, message: 'Categories reordered' });
  } catch (err) { next(err); }
};

// ──────────── SYNC ────────────

exports.runImport = async (req, res, next) => {
  try {
    const { source } = req.body;
    if (!['shopify', 'woocommerce'].includes(source)) {
      return res.status(400).json({ success: false, message: 'Source must be shopify or woocommerce' });
    }
    // Run async, return immediately
    const syncLog = await SyncLog.create({ source, type: 'import', status: 'running' });
    res.json({ success: true, message: `Import from ${source} started`, syncLogId: syncLog._id });

    // Run in background
    SyncEngine.run(source, 'import').catch(err => {
      console.error(`Import from ${source} failed:`, err.message);
    });
  } catch (err) { next(err); }
};

exports.runSync = async (req, res, next) => {
  try {
    const { source } = req.body;
    if (!['shopify', 'woocommerce'].includes(source)) {
      return res.status(400).json({ success: false, message: 'Source must be shopify or woocommerce' });
    }
    res.json({ success: true, message: `Sync from ${source} started` });
    SyncEngine.run(source, 'sync').catch(err => {
      console.error(`Sync from ${source} failed:`, err.message);
    });
  } catch (err) { next(err); }
};

exports.getSyncLogs = async (req, res, next) => {
  try {
    const logs = await SyncLog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

// ──────────── SETTINGS ────────────

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findById('global');
    if (!settings) {
      settings = await Settings.create({ _id: 'global' });
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findByIdAndUpdate('global', req.body, { new: true, upsert: true });
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// ──────────── DASHBOARD ────────────

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalProducts, totalCategories, shopifyCount, wcCount, inStockCount, lastSync] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Product.countDocuments({ source: 'shopify' }),
      Product.countDocuments({ source: 'woocommerce' }),
      Product.countDocuments({ inStock: true }),
      SyncLog.findOne().sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        shopifyCount,
        woocommerceCount: wcCount,
        inStockCount,
        outOfStockCount: totalProducts - inStockCount,
        lastSync: lastSync ? { source: lastSync.source, status: lastSync.status, date: lastSync.completedAt || lastSync.createdAt } : null,
      },
    });
  } catch (err) { next(err); }
};
