const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const Product = require('../models/product.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.getAllCategories = catchAsync(async (req, res, next) => {
    let filter = {};
    if (!req.user || req.user.role !== 'admin') {
        filter = { isDeleted: false, isActive: true };
    }
    const categories = await Category.find(filter);

    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories }
    });
});

exports.createCategory = catchAsync(async (req, res, next) => {
    const { title, isActive } = req.body;
    const newCategory = await Category.create({ title, isActive });
    
    logger.info(`Admin created category: ${title}`);
    res.status(201).json({
        status: 'success',
        data: { category: newCategory }
    });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }

    if (req.body.isActive === false) {
        await Subcategory.updateMany({ categoryId: category._id }, { isActive: false });
        await Product.updateMany({ categoryId: category._id }, { isActive: false });
    } else if (req.body.isActive === true) {
        await Subcategory.updateMany(
            { categoryId: category._id, isDeleted: false },
            { isActive: true }
        );
        await Product.updateMany(
            { categoryId: category._id, isDeleted: false },
            { isActive: true }
        );
    }

    logger.info(`Admin updated category: ${category._id}`);
    res.status(200).json({
        status: 'success',
        data: { category }
    });
});

exports.softDeleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }

    await Subcategory.updateMany({ categoryId: category._id }, { isDeleted: true });
    await Product.updateMany({ categoryId: category._id }, { isDeleted: true });

    logger.info(`Admin soft-deleted category: ${category._id}`);
    res.status(204).json({
        status: 'success',
        data: null
    });
});
