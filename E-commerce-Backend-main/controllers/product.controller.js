const Product = require('../models/product.model');
const CartItem = require('../models/cartItem.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');
const cache = require('../utilites/memoryCache.utils');

const cacheKey = 'productCache';

const isStorefrontUser = (req) => !req.user || req.user.role !== 'admin';

const getVisibilityFilter = (req) => {
    if (!isStorefrontUser(req)) return {};
    return { isDeleted: false, isActive: true };
};

const applySeasonFilter = (filter, season) => {
    if (!season) return filter;

    const seasonMatch = {
        $or: [
            { season },
            { season: 'All Year' },
            { season: { $exists: false } },
            { season: null }
        ]
    };
    return Object.keys(filter).length === 0
        ? seasonMatch
        : { $and: [filter, seasonMatch] };
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'season'];
    excludedFields.forEach(el => delete queryObj[el]);

    let filter = getVisibilityFilter(req);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    const queryFilter = JSON.parse(queryStr);
    filter = { ...filter, ...queryFilter };

    if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
    }

    filter = applySeasonFilter(filter, req.query.season);

    let query = Product.find(filter).populate('categoryId').populate('subCategoryId');

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 20;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const products = await query;
    const totalCount = await Product.countDocuments(filter);

    logger.info('Products fetched successfully');
    res.status(200).json({
        status: 'success',
        results: products.length,
        total: totalCount,
        data: { products }
    });
});

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate('categoryId').populate('subCategoryId');
    
    if (!product || (product.isDeleted && (!req.user || req.user.role !== 'admin'))) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { product }
    });
});

exports.getAdminProducts = catchAsync(async (req, res, next) => {
    const products = await Product.find()
        .populate('categoryId')
        .populate('subCategoryId')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products }
    });
});

const parseProductBody = (body, imagePath) => ({
    name: body.name,
    desc: body.desc,
    price: Number(body.price),
    stock: Number(body.stock) || 0,
    categoryId: body.categoryId,
    subCategoryId: body.subCategoryId || undefined,
    isActive: body.isActive === true || body.isActive === 'true',
    season: body.season || 'All Year',
    image: imagePath
});

exports.createProduct = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload an image for the product.', 400));
    }

    const newProduct = await Product.create(parseProductBody(req.body, req.file.path));
    logger.info(`Admin created product: ${newProduct.name}`);
    
    res.status(201).json({
        status: 'success',
        data: { product: newProduct }
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('No product found with that ID', 404));

    const updates = parseProductBody(req.body, product.image);
    if (req.file) updates.image = req.file.path;

    if (updates.price !== product.price) {
        await CartItem.updateMany({ productId: product._id }, { isPriceChanged: true });
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
    });

    logger.info(`Admin updated product: ${updatedProduct._id}`);
    res.status(200).json({
        status: 'success',
        data: { product: updatedProduct }
    });
});

exports.softDeleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    logger.info(`Admin soft-deleted product: ${product._id}`);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getBestSellers = catchAsync(async (req, res, next) => {
    let filter = applySeasonFilter(getVisibilityFilter(req), req.query.season);

    const products = await Product.find(filter)
        .populate('categoryId')
        .populate('subCategoryId')
        .sort('-soldCount')
        .limit(10);

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products }
    });
});

exports.getRelatedProducts = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    let filter = applySeasonFilter({
        categoryId: product.categoryId?._id || product.categoryId,
        _id: { $ne: product._id },
        ...getVisibilityFilter(req)
    }, req.query.season);

    const relatedProducts = await Product.find(filter).populate('categoryId').populate('subCategoryId').limit(5);

    res.status(200).json({
        status: 'success',
        results: relatedProducts.length,
        data: { products: relatedProducts }
    });
});