const Message = require('../models/message.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.sendMessage = catchAsync(async (req, res, next) => {
    const { subject, message } = req.body;
    if (!subject || !message) {
        return next(new AppError('Subject and message are required fields.', 400));
    }

    const msg = await Message.create({
        userId: req.user.id,
        subject,
        message
    });

    logger.info(`Contact message created by user ${req.user.id}`);
    res.status(201).json({
        status: 'success',
        data: { message: msg }
    });
});

exports.getAllMessagesAdmin = catchAsync(async (req, res, next) => {
    const messages = await Message.find()
        .populate('userId', 'name email mobile')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: { messages }
    });
});

exports.deleteMessageAdmin = catchAsync(async (req, res, next) => {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) {
        return next(new AppError('No message found with that ID', 404));
    }

    logger.info(`Contact message ${req.params.id} deleted by admin`);
    res.status(200).json({
        status: 'success',
        data: null
    });
});
