const Refund = require('../models/refund.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.requestRefund = catchAsync(async (req, res, next) => {
    const { orderId, reason } = req.body;

    if (!orderId || !reason) {
        return next(new AppError('Please provide orderId and reason.', 400));
    }

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });

    if (!order) {
        return next(new AppError('Order not found.', 404));
    }

    if (order.status !== 'received') {
        return next(new AppError('You can only request a refund for received orders.', 400));
    }

    const existingRefund = await Refund.findOne({ orderId, status: 'pending' });
    if (existingRefund) {
        return next(new AppError('A refund request is already pending for this order.', 400));
    }

    const refund = await Refund.create({
        orderId,
        userId: req.user.id,
        items: order.items,
        reason,
        refundedAmount: order.totalPrice
    });

    logger.info(`User ${req.user.id} requested refund for order ${order._id}`);
    res.status(201).json({
        status: 'success',
        data: { refund }
    });
});

exports.getAllRefundsAdmin = catchAsync(async (req, res, next) => {
    const refunds = await Refund.find().populate('orderId userId').sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: refunds.length,
        data: { refunds }
    });
});

exports.updateRefundStatus = catchAsync(async (req, res, next) => {
    const { status, adminResponse } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return next(new AppError('Invalid status value.', 400));
    }

    const refund = await Refund.findById(req.params.id);

    if (!refund) {
        return next(new AppError('Refund request not found.', 404));
    }

    if (refund.status !== 'pending') {
        return next(new AppError('This refund request has already been processed.', 400));
    }

    refund.status = status;
    if (adminResponse) {
        refund.adminResponse = adminResponse;
    }

    if (status === 'approved') {
        const order = await Order.findById(refund.orderId);
        if (order) {
            order.status = 'refunded';
            await order.save();
            
            for (let item of order.items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
            }
        }
    }

    await refund.save();

    logger.info(`Admin ${status} refund request ${refund._id}`);
    res.status(200).json({
        status: 'success',
        data: { refund }
    });
});
