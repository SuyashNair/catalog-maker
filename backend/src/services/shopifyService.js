/**
 * Shopify API Integration Service
 * Handles product import and synchronization from Shopify stores
 */

class ShopifyService {
  constructor(storeUrl, accessToken) {
    this.storeUrl = storeUrl?.replace(/\/$/, '');
    this.accessToken = accessToken;
    this.apiVersion = '2024-01';
  }

  get baseUrl() {
    return `${this.storeUrl}/admin/api/${this.apiVersion}`;
  }

  get headers() {
    return {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
    };
  }

  async fetchProducts(limit = 250, sinceId = null) {
    let url = `${this.baseUrl}/products.json?limit=${limit}&status=active`;
    if (sinceId) url += `&since_id=${sinceId}`;

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.products || [];
  }

  async fetchAllProducts() {
    const allProducts = [];
    let sinceId = null;
    let hasMore = true;

    while (hasMore) {
      const products = await this.fetchProducts(250, sinceId);
      if (products.length === 0) {
        hasMore = false;
      } else {
        allProducts.push(...products);
        sinceId = products[products.length - 1].id;
        if (products.length < 250) hasMore = false;
      }
    }

    return allProducts;
  }

  async fetchProduct(productId) {
    const url = `${this.baseUrl}/products/${productId}.json`;
    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    const data = await response.json();
    return data.product;
  }

  async fetchCollections() {
    const customUrl = `${this.baseUrl}/custom_collections.json?limit=250`;
    const smartUrl = `${this.baseUrl}/smart_collections.json?limit=250`;

    const [customRes, smartRes] = await Promise.all([
      fetch(customUrl, { headers: this.headers }),
      fetch(smartUrl, { headers: this.headers }),
    ]);

    const customData = customRes.ok ? await customRes.json() : { custom_collections: [] };
    const smartData = smartRes.ok ? await smartRes.json() : { smart_collections: [] };

    return [
      ...(customData.custom_collections || []),
      ...(smartData.smart_collections || []),
    ];
  }

  /**
   * Transform a Shopify product to our internal format
   */
  normalizeProduct(shopifyProduct) {
    const firstVariant = shopifyProduct.variants?.[0] || {};

    return {
      name: shopifyProduct.title,
      slug: this.createSlug(shopifyProduct.title, shopifyProduct.id),
      sku: firstVariant.sku || `SH-${shopifyProduct.id}`,
      price: parseFloat(firstVariant.price) || 0,
      compareAtPrice: parseFloat(firstVariant.compare_at_price) || 0,
      description: shopifyProduct.body_html || '',
      shortDescription: this.stripHtml(shopifyProduct.body_html || '').substring(0, 200),
      images: (shopifyProduct.images || []).map((img, idx) => ({
        url: img.src,
        thumbnail: img.src ? img.src.replace(/\.([^.]+)$/, '_400x400.$1') : '',
        alt: img.alt || shopifyProduct.title,
        width: img.width || 0,
        height: img.height || 0,
        position: idx,
      })),
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      inStock: firstVariant.inventory_quantity > 0 || firstVariant.inventory_policy === 'continue',
      stockQuantity: firstVariant.inventory_quantity ?? -1,
      variants: (shopifyProduct.variants || []).map(v => ({
        name: v.title,
        sku: v.sku || '',
        price: parseFloat(v.price) || 0,
        compareAtPrice: parseFloat(v.compare_at_price) || 0,
        inStock: v.inventory_quantity > 0 || v.inventory_policy === 'continue',
        options: new Map(Object.entries({
          option1: v.option1 || '',
          option2: v.option2 || '',
          option3: v.option3 || '',
        }).filter(([, val]) => val)),
      })),
      source: 'shopify',
      sourceId: String(shopifyProduct.id),
      sourceUrl: `${this.storeUrl}/products/${shopifyProduct.handle}`,
      sourceData: {
        handle: shopifyProduct.handle,
        vendor: shopifyProduct.vendor,
        productType: shopifyProduct.product_type,
        publishedAt: shopifyProduct.published_at,
      },
    };
  }

  createSlug(title, id) {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${base}-sh-${id}`;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  }
}

module.exports = ShopifyService;
