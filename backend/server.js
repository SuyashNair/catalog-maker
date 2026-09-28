require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { seedAdmin } = require('./src/middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/products', require('./src/routes/products'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/config', require('./src/routes/config'));
app.use('/api/admin', require('./src/routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const seed = require('./src/seed/demoData');
const Product = require('./src/models/Product');

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedAdmin();

  // Auto-seed if database is completely empty (useful for in-memory MongoDB)
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log('\n📦 Empty database detected. Auto-seeding initial data...');
    await seed();
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Catalog Maker API running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`👤 Admin: http://localhost:${PORT}/api/admin\n`);
  });
};

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
