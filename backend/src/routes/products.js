const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getFeatured } = require('../controllers/productController');

router.get('/featured', getFeatured);
router.get('/', getProducts);
router.get('/:slug', getProduct);

module.exports = router;
