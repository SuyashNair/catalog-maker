/**
 * WooCommerce API Integration Service
 * Handles product import and synchronization from WooCommerce stores
 */

class WooCommerceService {
  constructor(url, consumerKey, consumerSecret) {
    this.url = url?.replace(/\/$/, '');
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
  }

  get baseUrl() {
    return `${this.url}/wp-json/wc/v3`;
  }

  get authParams() {
    return `consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`;
  }

  async fetchProducts(page = 1, perPage = 100) {
    const url = `${this.baseUrl}/products?${this.authParams}&page=${page}&per_page=${perPage}&status=publish`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async fetchAllProducts() {
    const allProducts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const products = await this.fetchProducts(page, 100);
      if (products.length === 0) {
        hasMore = false;
      } else {
        allProducts.push(...products);
        page++;
        if (products.length < 100) hasMore = false;
      }
    }

    return allProducts;
  }

  async fetchProduct(productId) {
    const url = `${this.baseUrl}/products/${productId}?${this.authParams}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`);
    }
    return response.json();
  }

  async fetchCategories() {
    const url = `${this.baseUrl}/products/categories?${this.authParams}&per_page=100`;
    const response = await fetch(url);
    if (!response.ok) return [];
    return response.json();
  }

  /**
   * Transform a WooCommerce product to our internal format
   */
  normalizeProduct(wcProduct) {
    return {
      name: wcProduct.name,
      slug: this.createSlug(wcProduct.name, wcProduct.id),
      sku: wcProduct.sku || `WC-${wcProduct.id}`,
      price: parseFloat(wcProduct.price) || parseFloat(wcProduct.regular_price) || 0,
      compareAtPrice: parseFloat(wcProduct.regular_price) || 0,
      description: wcProduct.description || '',
      shortDescription: this.stripHtml(wcProduct.short_description || wcProduct.description || '').substring(0, 200),
      images: (wcProduct.images || []).map((img, idx) => ({
        url: img.src,
        thumbnail: img.src,
        alt: img.alt || wcProduct.name,
        width: 0,
        height: 0,
        position: idx,
      })),
      tags: (wcProduct.tags || []).map(t => t.name),
      inStock: wcProduct.in_stock !== false && wcProduct.stock_status !== 'outofstock',
      stockQuantity: wcProduct.stock_quantity ?? -1,
      variants: (wcProduct.variations || []).map(v => ({
        name: v.name || '',
        sku: v.sku || '',
        price: parseFloat(v.price) || 0,
        compareAtPrice: parseFloat(v.regular_price) || 0,
        inStock: v.in_stock !== false,
        options: new Map(),
      })),
      source: 'woocommerce',
      sourceId: String(wcProduct.id),
      sourceUrl: wcProduct.permalink || '',
      sourceData: {
        type: wcProduct.type,
        status: wcProduct.status,
        catalogVisibility: wcProduct.catalog_visibility,
        wcCategories: (wcProduct.categories || []).map(c => ({ id: c.id, name: c.name, slug: c.slug })),
      },
    };
  }

  createSlug(title, id) {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${base}-wc-${id}`;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  }
}

module.exports = WooCommerceService;
