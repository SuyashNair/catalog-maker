const Product = require('../models/Product');
const Category = require('../models/Category');

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}
function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

/**
 * GET /api/products
 * Public - List products with pagination, filtering, search
 */
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sort = '-createdAt',
      source,
      inStock,
      featured,
      minPrice,
      maxPrice,
    } = req.query;

    const query = { isVisible: true };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    if (source) query.source = source;
    if (inStock === 'true') query.inStock = true;
    if (featured === 'true') query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const cacheKey = `products:${JSON.stringify(query)}:${page}:${limit}:${sort}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    let sortObj = {};
    if (search) {
      sortObj = { score: { $meta: 'textScore' }, ...sortObj };
    }
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select('name slug price compareAtPrice images category inStock isFeatured source tags shortDescription')
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Return only first image thumbnail for list view (minimal payload)
    const minimalProducts = products.map(p => ({
      ...p,
      images: p.images?.length > 0 ? [{ url: p.images[0].url, thumbnail: p.images[0].thumbnail || p.images[0].url, alt: p.images[0].alt }] : [],
    }));

    const result = {
      success: true,
      data: minimalProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:slug
 * Public - Get product detail with related products
 */
exports.getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cacheKey = `product:${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const product = await Product.findOne({ slug, isVisible: true })
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get related products (same category, excluding current)
    const related = await Product.find({
      category: product.category?._id,
      _id: { $ne: product._id },
      isVisible: true,
    })
      .select('name slug price compareAtPrice images inStock')
      .limit(8)
      .lean();

    const relatedMinimal = related.map(p => ({
      ...p,
      images: p.images?.length > 0 ? [{ url: p.images[0].url, thumbnail: p.images[0].thumbnail || p.images[0].url, alt: p.images[0].alt }] : [],
    }));

    const result = {
      success: true,
      data: product,
      related: relatedMinimal,
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/featured
 * Public - Get featured products
 */
exports.getFeatured = async (req, res, next) => {
  try {
    const cached = getCached('featured');
    if (cached) return res.json(cached);

    const products = await Product.find({ isFeatured: true, isVisible: true })
      .select('name slug price compareAtPrice images category inStock')
      .populate('category', 'name slug')
      .limit(12)
      .lean();

    const result = { success: true, data: products };
    setCache('featured', result);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
