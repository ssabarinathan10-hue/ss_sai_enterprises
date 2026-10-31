const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getCategories,
  addReview,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.post('/upload', authMiddleware, adminMiddleware, uploadProductImage);
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
router.get('/:id', getProductById);
router.post('/:id/reviews', authMiddleware, addReview);

module.exports = router;
