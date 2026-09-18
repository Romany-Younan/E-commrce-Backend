const CartItem = require('../models/cartItem.model');
const Product = require('../models/product.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.getCart = catchAsync(async (req, res, next) => {
    const cartItems = await CartItem.find({ userId: req.user.id }).populate('productId');

    let validItems = [];
    let actionRequiredItems = [];
    let cartTotal = 0;

    for (let item of cartItems) {
        if (!item.productId || item.productId.isDeleted || !item.productId.isActive) {
            actionRequiredItems.push({
                cartItemId: item._id,
                issue: 'unavailable',
                message: 'This product is no longer available.'
            });
            continue;
        }

        const livePrice = item.productId.price;
        const liveStock = item.productId.stock;

        if (livePrice !== item.price) {
            item.isPriceChanged = true;
            await item.save();
            actionRequiredItems.push({
                cartItemId: item._id,
                product: item.productId,
                quantity: item.quantity,
                oldPrice: item.price,
                newPrice: livePrice,
                issue: 'price_changed',
                message: `Price changed from ${item.price} to ${livePrice}. Please review.`
            });
            continue;
        }

        if (liveStock === 0) {
            actionRequiredItems.push({
                cartItemId: item._id,
                product: item.productId,
                issue: 'out_of_stock',
                message: 'This product is currently out of stock.'
            });
            continue;
        }

        let validQuantity = item.quantity;
        if (item.quantity > liveStock) {
            validQuantity = liveStock;
        }

        validItems.push({
            cartItemId: item._id,
            product: item.productId,
            quantity: validQuantity,
            price: item.price,
            totalPrice: item.price * validQuantity
        });

        cartTotal += (item.price * validQuantity);
    }

    logger.info(`User ${req.user.id} fetched cart.`);
    res.status(200).json({
        status: 'success',
        data: {
            cartTotal,
            validItems,
            actionRequiredItems
        }
    });
});

exports.syncGuestCart = catchAsync(async (req, res, next) => {
    const { guestCart } = req.body;
    
    if (!guestCart || !Array.isArray(guestCart)) {
        return next(new AppError('Please provide a valid guestCart array', 400));
    }

    for (let guestItem of guestCart) {
        const product = await Product.findById(guestItem.productId);
        if (!product || product.stock === 0) continue;

        let existingItem = await CartItem.findOne({ userId: req.user.id, productId: guestItem.productId });

        if (existingItem) {
            existingItem.quantity = Math.min(existingItem.quantity + guestItem.quantity, product.stock);
            existingItem.price = product.price;
            existingItem.isPriceChanged = false;
            await existingItem.save();
        } else {
            await CartItem.create({
                userId: req.user.id,
                productId: guestItem.productId,
                productNameSnapshot: product.name,
                quantity: Math.min(guestItem.quantity, product.stock),
                price: product.price
            });
        }
    }

    logger.info(`User ${req.user.id} synced guest cart.`);
    res.status(200).json({
        status: 'success',
        message: 'Cart synced successfully'
    });
});

exports.addItem = catchAsync(async (req, res, next) => {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.isDeleted || !product.isActive) {
        return next(new AppError('Product not found or unavailable', 404));
    }

    if (product.stock < quantity) {
        return next(new AppError('Requested quantity exceeds available stock', 400));
    }

    let cartItem = await CartItem.findOne({ userId: req.user.id, productId });

    if (cartItem) {
        cartItem.quantity = Math.min(cartItem.quantity + quantity, product.stock);
        cartItem.price = product.price;
        cartItem.isPriceChanged = false;
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            userId: req.user.id,
            productId,
            productNameSnapshot: product.name,
            quantity: Math.min(quantity, product.stock),
            price: product.price
        });
    }

    logger.info(`User ${req.user.id} added item to cart.`);
    res.status(200).json({
        status: 'success',
        data: { cartItem }
    });
});

exports.updateQuantity = catchAsync(async (req, res, next) => {
    const { quantity } = req.body;
    
    if (quantity < 1) {
        return next(new AppError('Quantity must be at least 1. To remove, use the delete route.', 400));
    }

    const cartItem = await CartItem.findOne({ _id: req.params.id, userId: req.user.id }).populate('productId');
    
    if (!cartItem) {
        return next(new AppError('Cart item not found', 404));
    }

    if (cartItem.productId.stock < quantity) {
        return next(new AppError('Requested quantity exceeds available stock', 400));
    }

    cartItem.quantity = quantity;
    if (cartItem.isPriceChanged) {
        cartItem.price = cartItem.productId.price;
        cartItem.isPriceChanged = false;
    }
    
    await cartItem.save();

    logger.info(`User ${req.user.id} updated cart item quantity.`);
    res.status(200).json({
        status: 'success',
        data: { cartItem }
    });
});

exports.removeItem = catchAsync(async (req, res, next) => {
    const cartItem = await CartItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!cartItem) {
        return next(new AppError('Cart item not found', 404));
    }

    logger.info(`User ${req.user.id} removed item from cart.`);
    res.status(204).json({
        status: 'success',
        data: null
    });
});
