/**
 * Demo Data Seeder
 * Creates 50+ Shopify products and 50+ WooCommerce products
 * with realistic categories, images, and pricing
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');
const SyncLog = require('../models/SyncLog');
const Settings = require('../models/Settings');
const { seedAdmin } = require('../middleware/auth');

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
  'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600',
];

const CATEGORIES_DATA = [
  { name: 'Electronics', slug: 'electronics', desc: 'Latest gadgets and electronic devices' },
  { name: 'Fashion', slug: 'fashion', desc: 'Trendy clothing and accessories' },
  { name: 'Home & Living', slug: 'home-living', desc: 'Furniture and home decor' },
  { name: 'Sports & Fitness', slug: 'sports-fitness', desc: 'Sports equipment and fitness gear' },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', desc: 'Skincare, makeup and grooming' },
  { name: 'Books & Stationery', slug: 'books-stationery', desc: 'Books, notebooks and art supplies' },
  { name: 'Jewelry & Watches', slug: 'jewelry-watches', desc: 'Fine jewelry and designer watches' },
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', desc: 'Cookware, appliances and tableware' },
];

// 55 Shopify-sourced products
const SHOPIFY_PRODUCTS = [
  // Electronics
  { name: 'Wireless Bluetooth Earbuds Pro', price: 2999, cat: 0 },
  { name: 'Smart Watch Ultra Series 5', price: 8999, cat: 0 },
  { name: 'Portable Power Bank 20000mAh', price: 1499, cat: 0 },
  { name: 'USB-C Fast Charging Cable Set', price: 599, cat: 0 },
  { name: 'Mini Bluetooth Speaker Waterproof', price: 1999, cat: 0 },
  { name: 'Wireless Charging Pad Duo', price: 1299, cat: 0 },
  { name: 'Noise Cancelling Headphones X1', price: 4999, cat: 0 },
  // Fashion
  { name: 'Classic Cotton Polo T-Shirt', price: 899, cat: 1 },
  { name: 'Slim Fit Denim Jeans', price: 1499, cat: 1 },
  { name: 'Leather Crossbody Bag', price: 2499, cat: 1 },
  { name: 'Aviator Sunglasses Premium', price: 1299, cat: 1 },
  { name: 'Cotton Linen Casual Shirt', price: 999, cat: 1 },
  { name: 'Printed Summer Dress', price: 1799, cat: 1 },
  { name: 'Canvas Sneakers Unisex', price: 1599, cat: 1 },
  // Home & Living
  { name: 'Handwoven Jute Rug 5x7', price: 3499, cat: 2 },
  { name: 'Ceramic Plant Pot Set of 3', price: 999, cat: 2 },
  { name: 'Bamboo Photo Frame Collection', price: 799, cat: 2 },
  { name: 'Scented Soy Candle Gift Set', price: 1299, cat: 2 },
  { name: 'Velvet Throw Pillow Covers', price: 699, cat: 2 },
  { name: 'Wall Mounted Floating Shelf', price: 1499, cat: 2 },
  { name: 'LED String Fairy Lights', price: 499, cat: 2 },
  // Sports
  { name: 'Yoga Mat Premium 6mm', price: 1299, cat: 3 },
  { name: 'Resistance Band Set 5 Levels', price: 799, cat: 3 },
  { name: 'Stainless Steel Water Bottle 1L', price: 599, cat: 3 },
  { name: 'Jump Rope Speed Pro', price: 449, cat: 3 },
  { name: 'Foam Roller Muscle Recovery', price: 899, cat: 3 },
  { name: 'Running Armband Phone Holder', price: 399, cat: 3 },
  { name: 'Gym Gloves with Wrist Support', price: 699, cat: 3 },
  // Beauty
  { name: 'Vitamin C Face Serum 30ml', price: 999, cat: 4 },
  { name: 'Natural Bamboo Toothbrush Set', price: 349, cat: 4 },
  { name: 'Organic Hair Oil Blend 200ml', price: 599, cat: 4 },
  { name: 'Charcoal Face Wash 150ml', price: 449, cat: 4 },
  { name: 'Matte Lipstick Collection', price: 799, cat: 4 },
  { name: 'Aloe Vera Gel Pure 300ml', price: 299, cat: 4 },
  // Books & Stationery
  { name: 'Leather Bound Journal A5', price: 699, cat: 5 },
  { name: 'Watercolor Paint Set 24 Colors', price: 1299, cat: 5 },
  { name: 'Fountain Pen Gold Nib Premium', price: 2499, cat: 5 },
  { name: 'Sketch Pad 200gsm A4', price: 399, cat: 5 },
  { name: 'Calligraphy Brush Pen Set', price: 599, cat: 5 },
  { name: 'Motivational Book Bundle', price: 899, cat: 5 },
  // Jewelry
  { name: 'Sterling Silver Chain Necklace', price: 1999, cat: 6 },
  { name: 'Rose Gold Stud Earrings', price: 1499, cat: 6 },
  { name: 'Minimalist Wrist Watch Bronze', price: 3499, cat: 6 },
  { name: 'Pearl Bracelet Adjustable', price: 1299, cat: 6 },
  { name: 'Crystal Pendant Necklace', price: 2499, cat: 6 },
  { name: 'Titanium Ring Matte Finish', price: 1799, cat: 6 },
  // Kitchen
  { name: 'Cast Iron Skillet 10 inch', price: 1999, cat: 7 },
  { name: 'Bamboo Cutting Board Set', price: 899, cat: 7 },
  { name: 'Stainless Steel Knife Set 5pc', price: 2499, cat: 7 },
  { name: 'Glass Spice Jar Set 12pc', price: 799, cat: 7 },
  { name: 'Silicone Spatula Set Heat Proof', price: 449, cat: 7 },
  { name: 'Copper Bottom Tea Kettle', price: 1299, cat: 7 },
  { name: 'Ceramic Dinner Plate Set 6pc', price: 1799, cat: 7 },
  { name: 'Insulated Lunch Box Tiffin', price: 699, cat: 7 },
  { name: 'Electric Hand Mixer 300W', price: 1499, cat: 7 },
  { name: 'French Press Coffee Maker', price: 999, cat: 7 },
];

// 55 WooCommerce-sourced products
const WOOCOMMERCE_PRODUCTS = [
  // Electronics
  { name: 'TWS Earphones Active NC', price: 3499, cat: 0 },
  { name: 'Digital Alarm Clock LED', price: 899, cat: 0 },
  { name: 'Webcam HD 1080p USB', price: 2499, cat: 0 },
  { name: 'Wireless Mouse Ergonomic', price: 799, cat: 0 },
  { name: 'RGB Mechanical Keyboard', price: 3999, cat: 0 },
  { name: 'Tablet Stand Adjustable', price: 699, cat: 0 },
  { name: 'HDMI Cable 4K 2m Braided', price: 499, cat: 0 },
  // Fashion
  { name: 'Oversized Graphic Hoodie', price: 1799, cat: 1 },
  { name: 'Chino Pants Regular Fit', price: 1299, cat: 1 },
  { name: 'Woven Straw Tote Bag', price: 999, cat: 1 },
  { name: 'Round Metal Frame Glasses', price: 799, cat: 1 },
  { name: 'Fleece Zip-Up Jacket', price: 1999, cat: 1 },
  { name: 'Floral Maxi Skirt', price: 1399, cat: 1 },
  { name: 'Leather Belt Genuine Cowhide', price: 899, cat: 1 },
  // Home & Living
  { name: 'Macrame Wall Hanging Large', price: 1499, cat: 2 },
  { name: 'Terracotta Decorative Vase', price: 899, cat: 2 },
  { name: 'Wooden Desk Organizer', price: 699, cat: 2 },
  { name: 'Aroma Oil Diffuser Electric', price: 1299, cat: 2 },
  { name: 'Cotton Duvet Cover King', price: 2499, cat: 2 },
  { name: 'Metal Wall Clock Modern', price: 1799, cat: 2 },
  { name: 'Indoor Plant Fern Artificial', price: 599, cat: 2 },
  // Sports
  { name: 'Dumbbell Set Neoprene 5kg Pair', price: 1499, cat: 3 },
  { name: 'Badminton Racket Professional', price: 1999, cat: 3 },
  { name: 'Sports Duffle Bag 40L', price: 1299, cat: 3 },
  { name: 'Swim Goggles Anti-Fog', price: 599, cat: 3 },
  { name: 'Ab Roller Wheel Pro', price: 799, cat: 3 },
  { name: 'Compression Socks Running', price: 399, cat: 3 },
  { name: 'Cricket Batting Gloves Leather', price: 1199, cat: 3 },
  // Beauty
  { name: 'Retinol Night Cream 50ml', price: 1299, cat: 4 },
  { name: 'Jade Roller & Gua Sha Set', price: 799, cat: 4 },
  { name: 'Argan Oil Shampoo 300ml', price: 549, cat: 4 },
  { name: 'Sunscreen SPF 50+ PA+++ 100ml', price: 699, cat: 4 },
  { name: 'Eye Shadow Palette 12 Shades', price: 999, cat: 4 },
  { name: 'Body Butter Shea 200g', price: 499, cat: 4 },
  // Books
  { name: 'Dot Grid Bullet Journal', price: 599, cat: 5 },
  { name: 'Oil Pastel Set 36 Colors', price: 899, cat: 5 },
  { name: 'Mechanical Pencil Set 0.5mm', price: 349, cat: 5 },
  { name: 'Craft Paper Origami Pack 200', price: 249, cat: 5 },
  { name: 'Acrylic Marker Pen Set 24', price: 799, cat: 5 },
  { name: 'Self-Help Book Bestseller Pack', price: 1299, cat: 5 },
  // Jewelry
  { name: 'Gold Plated Hoop Earrings', price: 999, cat: 6 },
  { name: 'Leather Wrap Bracelet Men', price: 799, cat: 6 },
  { name: 'Chronograph Watch Steel', price: 4999, cat: 6 },
  { name: 'Anklet Chain Sterling Silver', price: 699, cat: 6 },
  { name: 'Gemstone Ring Amethyst', price: 2999, cat: 6 },
  { name: 'Cufflinks Set Stainless Steel', price: 1199, cat: 6 },
  // Kitchen
  { name: 'Non-Stick Frying Pan 24cm', price: 1299, cat: 7 },
  { name: 'Chopper Vegetable Manual', price: 599, cat: 7 },
  { name: 'Mixing Bowl Stainless Set 3pc', price: 799, cat: 7 },
  { name: 'Measuring Cup & Spoon Set', price: 349, cat: 7 },
  { name: 'Pizza Stone with Paddle', price: 1999, cat: 7 },
  { name: 'Glass Water Jug 1.5L', price: 499, cat: 7 },
  { name: 'Electric Kettle 1.8L SS', price: 1199, cat: 7 },
  { name: 'Baking Tray Non-Stick Set', price: 899, cat: 7 },
  { name: 'Coffee Mug Ceramic Set 4', price: 699, cat: 7 },
];

function getImages(index) {
  const mainImg = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
  const secondImg = PLACEHOLDER_IMAGES[(index + 3) % PLACEHOLDER_IMAGES.length];
  const thirdImg = PLACEHOLDER_IMAGES[(index + 6) % PLACEHOLDER_IMAGES.length];
  return [
    { url: mainImg, thumbnail: mainImg, alt: '', position: 0 },
    { url: secondImg, thumbnail: secondImg, alt: '', position: 1 },
    { url: thirdImg, thumbnail: thirdImg, alt: '', position: 2 },
  ];
}

function createSlug(name, prefix, id) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${base}-${prefix}-${id}`;
}

function generateDescription(name, catName) {
  return `<p>Premium quality <strong>${name}</strong> from our ${catName} collection. Crafted with attention to detail and built to last. This product features superior materials, modern design, and exceptional value for money.</p><p>Whether you're shopping for yourself or looking for the perfect gift, this item is sure to impress. Fast shipping and hassle-free returns available.</p>`;
}

async function seed() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
      console.log('Connected to MongoDB');
    }

    // Clear existing data
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      SyncLog.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create categories
    const categories = [];
    for (let i = 0; i < CATEGORIES_DATA.length; i++) {
      const cat = await Category.create({
        ...CATEGORIES_DATA[i],
        description: CATEGORIES_DATA[i].desc,
        image: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
        displayOrder: i,
        isVisible: true,
      });
      categories.push(cat);
    }
    console.log(`Created ${categories.length} categories`);

    // Create Shopify products
    const shopifyLog = await SyncLog.create({
      source: 'shopify', type: 'import', status: 'running',
      stats: { total: SHOPIFY_PRODUCTS.length },
    });

    for (let i = 0; i < SHOPIFY_PRODUCTS.length; i++) {
      const p = SHOPIFY_PRODUCTS[i];
      const cat = categories[p.cat];
      const images = getImages(i);
      images.forEach(img => img.alt = p.name);

      await Product.create({
        name: p.name,
        slug: createSlug(p.name, 'sh', i + 1),
        sku: `SH-${String(i + 1001).padStart(4, '0')}`,
        price: p.price,
        compareAtPrice: Math.round(p.price * 1.3),
        currency: 'INR',
        description: generateDescription(p.name, cat.name),
        shortDescription: `Premium ${p.name} - High quality ${cat.name.toLowerCase()} product`,
        images,
        category: cat._id,
        categories: [cat._id],
        tags: [cat.name.toLowerCase(), 'shopify', 'trending'],
        inStock: Math.random() > 0.15,
        stockQuantity: Math.floor(Math.random() * 100) + 1,
        variants: i % 3 === 0 ? [
          { name: 'Small', sku: `SH-${i + 1001}-S`, price: p.price, inStock: true },
          { name: 'Medium', sku: `SH-${i + 1001}-M`, price: p.price, inStock: true },
          { name: 'Large', sku: `SH-${i + 1001}-L`, price: p.price + 200, inStock: Math.random() > 0.3 },
        ] : [],
        source: 'shopify',
        sourceId: String(i + 1001),
        sourceUrl: `https://demo-store.myshopify.com/products/${createSlug(p.name, 'sh', i + 1)}`,
        isFeatured: i < 8,
        displayOrder: i,
        lastSyncedAt: new Date(),
      });
      shopifyLog.stats.created++;
    }

    shopifyLog.status = 'completed';
    shopifyLog.completedAt = new Date();
    await shopifyLog.save();
    console.log(`Created ${SHOPIFY_PRODUCTS.length} Shopify products`);

    // Create WooCommerce products
    const wcLog = await SyncLog.create({
      source: 'woocommerce', type: 'import', status: 'running',
      stats: { total: WOOCOMMERCE_PRODUCTS.length },
    });

    for (let i = 0; i < WOOCOMMERCE_PRODUCTS.length; i++) {
      const p = WOOCOMMERCE_PRODUCTS[i];
      const cat = categories[p.cat];
      const images = getImages(i + 5);
      images.forEach(img => img.alt = p.name);

      await Product.create({
        name: p.name,
        slug: createSlug(p.name, 'wc', i + 1),
        sku: `WC-${String(i + 2001).padStart(4, '0')}`,
        price: p.price,
        compareAtPrice: Math.round(p.price * 1.25),
        currency: 'INR',
        description: generateDescription(p.name, cat.name),
        shortDescription: `Quality ${p.name} - Best in ${cat.name.toLowerCase()}`,
        images,
        category: cat._id,
        categories: [cat._id],
        tags: [cat.name.toLowerCase(), 'woocommerce', 'popular'],
        inStock: Math.random() > 0.1,
        stockQuantity: Math.floor(Math.random() * 80) + 5,
        variants: i % 4 === 0 ? [
          { name: 'Default', sku: `WC-${i + 2001}-D`, price: p.price, inStock: true },
          { name: 'Premium', sku: `WC-${i + 2001}-P`, price: p.price + 500, inStock: true },
        ] : [],
        source: 'woocommerce',
        sourceId: String(i + 2001),
        sourceUrl: `https://demo-store.example.com/product/${createSlug(p.name, 'wc', i + 1)}`,
        isFeatured: i < 6,
        displayOrder: i,
        lastSyncedAt: new Date(),
      });
      wcLog.stats.created++;
    }

    wcLog.status = 'completed';
    wcLog.completedAt = new Date();
    await wcLog.save();
    console.log(`Created ${WOOCOMMERCE_PRODUCTS.length} WooCommerce products`);

    // Update category product counts
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat._id, isVisible: true });
      cat.productCount = count;
      await cat.save();
    }

    // Create default settings
    await Settings.create({
      _id: 'global',
      catalogName: 'Catalog Maker',
      catalogDescription: 'Browse our premium product catalog',
      whatsappNumber: '919999999999',
      activeDesign: 'elegant',
      primaryColor: '#c9a55a',
    });

    // Seed admin
    await seedAdmin();

    console.log('\n--- Seeding Complete ---');
    console.log(`Categories: ${categories.length}`);
    console.log(`Shopify Products: ${SHOPIFY_PRODUCTS.length}`);
    console.log(`WooCommerce Products: ${WOOCOMMERCE_PRODUCTS.length}`);
    console.log(`Total Products: ${SHOPIFY_PRODUCTS.length + WOOCOMMERCE_PRODUCTS.length}`);
    console.log('Admin: admin@catalogmaker.com / admin123');

    return true;
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seed;
