const express = require('express');
const subcategoryController = require('../controllers/subcategory.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const router = express.Router();

router.route('/')
    .get(subcategoryController.getAllSubcategories)
    .post(authMiddleware, restrictTo('admin'), subcategoryController.createSubcategory);

router.route('/:id')
    .patch(authMiddleware, restrictTo('admin'), subcategoryController.updateSubcategory)
    .delete(authMiddleware, restrictTo('admin'), subcategoryController.softDeleteSubcategory);

module.exports = router;
