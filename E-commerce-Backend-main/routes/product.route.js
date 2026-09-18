const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const router = express.Router();

router.get('/admin/list', authMiddleware, restrictTo('admin'), productController.getAdminProducts);

router.route('/')
    .get(productController.getAllProducts)
    .post(authMiddleware, restrictTo('admin'), upload.single('image'), productController.createProduct);

router.get('/best-sellers', productController.getBestSellers);
router.get('/:id/related', productController.getRelatedProducts);

router.route('/:id')
    .get(productController.getProduct)
    .patch(authMiddleware, restrictTo('admin'), upload.single('image'), productController.updateProduct)
    .delete(authMiddleware, restrictTo('admin'), productController.softDeleteProduct);

module.exports = router;