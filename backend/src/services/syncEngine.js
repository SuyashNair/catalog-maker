/**
 * Sync Engine - Handles importing and synchronizing products from external sources
 */
const Product = require('../models/Product');
const Category = require('../models/Category');
const SyncLog = require('../models/SyncLog');
const Settings = require('../models/Settings');
const ShopifyService = require('./shopifyService');
const WooCommerceService = require('./woocommerceService');

class SyncEngine {
  /**
   * Run a full import or sync from a source
   * @param {'shopify'|'woocommerce'} source
   * @param {'import'|'sync'} type
   */
  static async run(source, type = 'import') {
    const syncLog = await SyncLog.create({ source, type, status: 'running' });

    try {
      const settings = await Settings.findById('global');
      let service;
      let products;

      if (source === 'shopify') {
        const storeUrl = settings?.shopify?.storeUrl || process.env.SHOPIFY_STORE_URL;
        const token = settings?.shopify?.accessToken || process.env.SHOPIFY_ACCESS_TOKEN;
        if (!storeUrl || !token) {
          throw new Error('Shopify credentials not configured');
        }
        service = new ShopifyService(storeUrl, token);
        products = await service.fetchAllProducts();
      } else if (source === 'woocommerce') {
        const url = settings?.woocommerce?.url || process.env.WOOCOMMERCE_URL;
        const key = settings?.woocommerce?.consumerKey || process.env.WOOCOMMERCE_KEY;
        const secret = settings?.woocommerce?.consumerSecret || process.env.WOOCOMMERCE_SECRET;
        if (!url || !key || !secret) {
          throw new Error('WooCommerce credentials not configured');
        }
        service = new WooCommerceService(url, key, secret);
        products = await service.fetchAllProducts();
      } else {
        throw new Error(`Unknown source: ${source}`);
      }

      syncLog.stats.total = products.length;

      // Process each product
      for (const rawProduct of products) {
        try {
          const normalized = service.normalizeProduct(rawProduct);
          await this.upsertProduct(normalized, syncLog);
        } catch (err) {
          syncLog.stats.failed++;
          syncLog.errors.push({
            productId: String(rawProduct.id),
            productName: rawProduct.title || rawProduct.name || 'Unknown',
            error: err.message,
          });
        }
      }

      syncLog.status = syncLog.stats.failed > 0 ? 'partial' : 'completed';
      syncLog.completedAt = new Date();
      await syncLog.save();

      // Update category product counts
      await this.updateCategoryCounts();

      return syncLog;
    } catch (err) {
      syncLog.status = 'failed';
      syncLog.completedAt = new Date();
      syncLog.errors.push({
        productId: 'system',
        productName: 'System Error',
        error: err.message,
      });
      await syncLog.save();
      throw err;
    }
  }

  /**
   * Upsert a product - create or update based on source+sourceId
   */
  static async upsertProduct(productData, syncLog) {
    const existing = await Product.findOne({
      source: productData.source,
      sourceId: productData.sourceId,
    });

    // Resolve category
    if (productData.sourceData?.wcCategories?.length > 0) {
      const cat = productData.sourceData.wcCategories[0];
      const category = await this.resolveCategory(cat.name, cat.slug);
      productData.category = category._id;
    } else if (productData.sourceData?.productType) {
      const category = await this.resolveCategory(productData.sourceData.productType);
      productData.category = category._id;
    } else if (productData.tags?.length > 0) {
      const category = await this.resolveCategory(productData.tags[0]);
      productData.category = category._id;
    }

    if (existing) {
      // Update existing product
      Object.assign(existing, {
        name: productData.name,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice,
        description: productData.description,
        shortDescription: productData.shortDescription,
        images: productData.images,
        tags: productData.tags,
        inStock: productData.inStock,
        stockQuantity: productData.stockQuantity,
        variants: productData.variants,
        sourceUrl: productData.sourceUrl,
        sourceData: productData.sourceData,
        category: productData.category || existing.category,
        lastSyncedAt: new Date(),
      });
      await existing.save();
      syncLog.stats.updated++;
    } else {
      // Create new product
      await Product.create({
        ...productData,
        lastSyncedAt: new Date(),
      });
      syncLog.stats.created++;
    }
  }

  /**
   * Find or create a category by name
   */
  static async resolveCategory(name, slug = null) {
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    let category = await Category.findOne({ slug });
    if (!category) {
      category = await Category.create({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        slug,
      });
    }
    return category;
  }

  /**
   * Update product counts on all categories
   */
  static async updateCategoryCounts() {
    const categories = await Category.find();
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat._id, isVisible: true });
      cat.productCount = count;
      await cat.save();
    }
  }
}

module.exports = SyncEngine;
