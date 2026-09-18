const express = require('express');
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const router = express.Router();

router.route('/')
    .get(categoryController.getAllCategories)
    .post(authMiddleware, restrictTo('admin'), categoryController.createCategory);

router.route('/:id')
    .patch(authMiddleware, restrictTo('admin'), categoryController.updateCategory)
    .delete(authMiddleware, restrictTo('admin'), categoryController.softDeleteCategory);

module.exports = router;
