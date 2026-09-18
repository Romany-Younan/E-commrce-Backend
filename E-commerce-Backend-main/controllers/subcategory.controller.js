const Subcategory = require('../models/subcategory.model');
const Product = require('../models/product.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.getAllSubcategories = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;

    if (!req.user || req.user.role !== 'admin') {
        filter.isDeleted = false;
        filter.isActive = true;
    }

    const subcategories = await Subcategory.find(filter).populate('categoryId', 'title');

    res.status(200).json({
        status: 'success',
        results: subcategories.length,
        data: { subcategories }
    });
});

exports.createSubcategory = catchAsync(async (req, res, next) => {
    const { title, categoryId, isActive } = req.body;
    const newSubcategory = await Subcategory.create({ title, categoryId, isActive });
    
    logger.info(`Admin created subcategory: ${title}`);
    res.status(201).json({
        status: 'success',
        data: { subcategory: newSubcategory }
    });
});

exports.updateSubcategory = catchAsync(async (req, res, next) => {
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!subcategory) {
        return next(new AppError('No subcategory found with that ID', 404));
    }

    if (req.body.isActive === false) {
        await Product.updateMany({ subCategoryId: subcategory._id }, { isActive: false });
    } else if (req.body.isActive === true) {
        await Product.updateMany(
            { subCategoryId: subcategory._id, isDeleted: false },
            { isActive: true }
        );
    }

    logger.info(`Admin updated subcategory: ${subcategory._id}`);
    res.status(200).json({
        status: 'success',
        data: { subcategory }
    });
});

exports.softDeleteSubcategory = catchAsync(async (req, res, next) => {
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

    if (!subcategory) {
        return next(new AppError('No subcategory found with that ID', 404));
    }

    await Product.updateMany({ subCategoryId: subcategory._id }, { isDeleted: true });

    logger.info(`Admin soft-deleted subcategory: ${subcategory._id}`);
    res.status(204).json({
        status: 'success',
        data: null
    });
});
