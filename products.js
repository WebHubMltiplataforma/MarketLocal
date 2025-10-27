const express = require('express');
const {
  createProduct,
  getProducts,
  getProduct,
  getUserProducts,
  deleteProduct
} = require('../controllers/productController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', requireAuth, createProduct);
router.get('/user/products', requireAuth, getUserProducts);
router.delete('/:id', requireAuth, deleteProduct);

module.exports = router;