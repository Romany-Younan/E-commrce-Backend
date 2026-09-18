const Testimonial = require('../models/testimonial.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.getMyTestimonial = catchAsync(async (req, res, next) => {
    const testimonial = await Testimonial.findOne({ userId: req.user.id });
    res.status(200).json({
        status: 'success',
        data: { testimonial }
    });
});

exports.submitTestimonial = catchAsync(async (req, res, next) => {
    const { comment, stars } = req.body;

    const existing = await Testimonial.findOne({
        userId: req.user.id,
        status: { $in: ['pending', 'approved'] }
    });

    if (existing) {
        return next(new AppError('You already have a submitted or approved testimonial.', 400));
    }

    const testimonial = await Testimonial.create({
        userId: req.user.id,
        userName: req.user.name,
        comment,
        stars
    });

    logger.info(`User ${req.user.id} submitted a testimonial.`);
    res.status(201).json({
        status: 'success',
        data: { testimonial }
    });
});

exports.getPublicTestimonials = catchAsync(async (req, res, next) => {
    const testimonials = await Testimonial.find({ status: 'approved' }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: testimonials.length,
        data: { testimonials }
    });
});

exports.getAllTestimonialsAdmin = catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };
    const testimonials = await Testimonial.find(queryObj).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: testimonials.length,
        data: { testimonials }
    });
});

exports.updateTestimonialStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;

    if (!['pending', 'approved', 'refused'].includes(status)) {
        return next(new AppError('Invalid status value.', 400));
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
        req.params.id, 
        { status, isUserViewed: false },
        { new: true, runValidators: true }
    );

    if (!testimonial) {
        return next(new AppError('Testimonial not found.', 404));
    }

    logger.info(`Admin updated testimonial ${req.params.id} to ${status}`);
    res.status(200).json({
        status: 'success',
        data: { testimonial }
    });
});

exports.markTestimonialViewed = catchAsync(async (req, res, next) => {
    const testimonial = await Testimonial.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { isUserViewed: true },
        { new: true }
    );

    if (!testimonial) {
        return next(new AppError('Testimonial not found.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { testimonial }
    });
});

exports.cancelMyTestimonial = catchAsync(async (req, res, next) => {
    const testimonial = await Testimonial.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
        status: 'pending'
    });

    if (!testimonial) {
        return next(new AppError('No pending testimonial found to cancel.', 404));
    }

    logger.info(`User ${req.user.id} cancelled their testimonial.`);
    res.status(204).json({ status: 'success', data: null });
});

exports.updateMyTestimonial = catchAsync(async (req, res, next) => {
    const { comment, stars } = req.body;

    const testimonial = await Testimonial.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id, status: 'approved' },
        { comment, stars, status: 'pending', isUserViewed: true },
        { new: true, runValidators: true }
    );

    if (!testimonial) {
        return next(new AppError('No approved testimonial found to update.', 404));
    }

    logger.info(`User ${req.user.id} updated their approved testimonial — reset to pending.`);
    res.status(200).json({
        status: 'success',
        data: { testimonial }
    });
});
