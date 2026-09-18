const Order = require('../models/order.model');
const CartItem = require('../models/cartItem.model');
const Product = require('../models/product.model');
const Address = require('../models/address.model');
const mongoose = require('mongoose');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { phoneNumber, backupPhone } = req.body;

    if (!phoneNumber) {
        return next(new AppError('Please provide a phone number for delivery.', 400));
    }

    const cartItems = await CartItem.find({ userId: req.user.id }).populate('productId');
    
    let validItems = [];
    let totalPrice = 0;

    for (let item of cartItems) {
        if (!item.productId || item.productId.isDeleted || !item.productId.isActive || item.productId.stock === 0 || item.price !== item.productId.price) {
            continue;
        }
        
        let validQuantity = item.quantity > item.productId.stock ? item.productId.stock : item.quantity;

        validItems.push({
            productId: item.productId._id,
            productNameSnapshot: item.productId.name,
            quantity: validQuantity,
            priceSnapshot: item.price
        });
        
        totalPrice += (item.price * validQuantity);
    }

    if (validItems.length === 0) {
        return next(new AppError('Your cart is empty or all items require action. Please review your cart.', 400));
    }

    const address = await Address.findOne({ userId: req.user.id, isDefault: true });
    if (!address) {
        return next(new AppError('Please add a default delivery address before checkout.', 400));
    }
    
    const addressSnapshot = `${address.label}: ${address.addressText}`;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        for (let item of validItems) {
            const result = await Product.findOneAndUpdate(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity, soldCount: item.quantity } },
                { new: true, session }
            );
            if (!result) {
                await session.abortTransaction();
                session.endSession();
                return next(new AppError(`Insufficient stock for product "${item.productNameSnapshot}". Please review your cart.`, 400));
            }
        }

        const [order] = await Order.create([{
            userId: req.user.id,
            items: validItems,
            totalPrice,
            paymentMethod: 'Cash On Delivery',
            addressSnapshot,
            phoneNumber,
            backupPhone: backupPhone || ''
        }], { session });

        const validProductIds = validItems.map(i => i.productId);
        await CartItem.deleteMany({ userId: req.user.id, productId: { $in: validProductIds } }, { session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`User ${req.user.id} placed order: ${order._id}`);
        res.status(201).json({
            status: 'success',
            data: { order }
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ userId: req.user.id }).sort('-createdAt').lean();

    const mappedOrders = orders.map(order => {
        if (order.status === 'cancelledByAdmin' || order.status === 'cancelledByUser') {
            order.status = 'cancelled';
        }
        return order;
    });

    res.status(200).json({
        status: 'success',
        results: mappedOrders.length,
        data: { orders: mappedOrders }
    });
});


exports.getMyOrderById = catchAsync(async (req, res, next) => {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!order) {
        return next(new AppError('Order not found', 404));
    }
    
    if (order.status === 'cancelledByAdmin' || order.status === 'cancelledByUser') {
        order.status = 'cancelled';
    }

    res.status(200).json({
        status: 'success',
        data: { order }
    });
});

exports.cancelMyOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });

    if (!order) {
        return next(new AppError('Order not found.', 404));
    }

    if (!['pending', 'preparing'].includes(order.status)) {
        return next(new AppError('You can only cancel orders that are pending or preparing.', 400));
    }

    for (let item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
    }

    order.status = 'cancelledByUser';
    await order.save();

    logger.info(`User ${req.user.id} cancelled order: ${order._id}`);
    res.status(200).json({
        status: 'success',
        data: { order }
    });
});




exports.getAllOrdersAdmin = catchAsync(async (req, res, next) => {
    const orders = await Order.find().sort('-createdAt').populate('userId', 'name mobile');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
    });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found.', 404));
    }

    const cancelStatuses = ['cancelledByUser', 'cancelledByAdmin'];
    if (cancelStatuses.includes(status) && !cancelStatuses.includes(order.status)) {
        for (let item of order.items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
        }
    }

    order.status = status;
    await order.save();

    logger.info(`Admin updated order ${order._id} status to ${status}`);
    res.status(200).json({
        status: 'success',
        data: { order }
    });
});

exports.getSalesReport = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return next(new AppError('Please provide startDate and endDate query parameters.', 400));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const summary = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                status: { $nin: ['refused', 'cancelledByUser', 'cancelledByAdmin', 'refunded'] }
            }
        },
        { $unwind: '$items' },
        {
            $addFields: {
                'items.totalPrice': { $multiply: ['$items.priceSnapshot', '$items.quantity'] }
            }
        },
        {
            $facet: {
                overallStats: [
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$items.totalPrice' },
                            totalQuantitySold: { $sum: '$items.quantity' },
                            totalOrders: { $addToSet: '$_id' }
                        }
                    },
                    {
                        $addFields: {
                            totalOrders: { $size: '$totalOrders' }
                        }
                    }
                ],
                topProducts: [
                    {
                        $group: {
                            _id: '$items.productId',
                            name: { $first: '$items.productNameSnapshot' },
                            revenue: { $sum: '$items.totalPrice' },
                            quantitySold: { $sum: '$items.quantity' }
                        }
                    },
                    { $sort: { revenue: -1 } },
                    { $limit: 5 }
                ],
                topClients: [
                    {
                        $group: {
                            _id: '$userId',
                            totalSpent: { $sum: '$items.totalPrice' },
                            totalOrders: { $addToSet: '$_id' },
                            totalQuantity: { $sum: '$items.quantity' }
                        }
                    },
                    {
                        $addFields: {
                            totalOrders: { $size: '$totalOrders' }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    { $unwind: '$user' },
                    {
                        $project: {
                            _id: 1,
                            name: '$user.name',
                            mobile: '$user.mobile',
                            totalSpent: 1,
                            totalOrders: 1,
                            totalQuantity: 1
                        }
                    },
                    { $sort: { totalSpent: -1 } },
                    { $limit: 5 }
                ],
                monthlySales: [
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' }
                            },
                            totalRevenue: { $sum: '$items.totalPrice' },
                            totalQuantity: { $sum: '$items.quantity' }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]
            }
        }
    ]);

    logger.info(`Admin generated sales report from ${startDate} to ${endDate}`);
    res.status(200).json({
        status: 'success',
        data: summary[0]
    });
});
