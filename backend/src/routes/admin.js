const express = require('express');
const router = express.Router();
const { protect, login } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const Settings = require('../models/Settings');

// Auth
router.post('/login', login);

// Dashboard
router.get('/dashboard', protect, admin.getDashboard);

// Products
router.get('/products', protect, admin.getAllProducts);
router.post('/products', protect, admin.createProduct);
router.put('/products/:id', protect, admin.updateProduct);
router.delete('/products/:id', protect, admin.deleteProduct);

// Categories
router.get('/categories', protect, admin.getAllCategories);
router.post('/categories', protect, admin.createCategory);
router.put('/categories/:id', protect, admin.updateCategory);
router.delete('/categories/:id', protect, admin.deleteCategory);
router.put('/categories-reorder', protect, admin.reorderCategories);

// Import & Sync
router.post('/import', protect, admin.runImport);
router.post('/sync', protect, admin.runSync);
router.get('/sync-logs', protect, admin.getSyncLogs);

// Settings
router.get('/settings', protect, admin.getSettings);
router.put('/settings', protect, admin.updateSettings);

module.exports = router;
