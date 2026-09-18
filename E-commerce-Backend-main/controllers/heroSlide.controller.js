const HeroSlide = require('../models/heroSlide.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.getSlides = catchAsync(async (req, res, next) => {
    const slides = await HeroSlide.find({ isActive: true }).sort('order');
    res.status(200).json({
        status: 'success',
        results: slides.length,
        data: { slides }
    });
});

exports.getAllSlidesAdmin = catchAsync(async (req, res, next) => {
    const slides = await HeroSlide.find().sort('order');
    res.status(200).json({
        status: 'success',
        results: slides.length,
        data: { slides }
    });
});

exports.createSlide = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload an image for the slide.', 400));
    }
    const { title, subtitle, ctaText, ctaLink, order } = req.body;
    const slide = await HeroSlide.create({
        title,
        subtitle,
        ctaText,
        ctaLink,
        image: req.file.path,
        order: order || 0
    });
    logger.info(`Admin created hero slide: ${slide._id}`);
    res.status(201).json({ status: 'success', data: { slide } });
});

exports.updateSlide = catchAsync(async (req, res, next) => {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return next(new AppError('Slide not found', 404));

    const { title, subtitle, ctaText, ctaLink, order, isActive } = req.body;
    if (title) slide.title = title;
    if (subtitle !== undefined) slide.subtitle = subtitle;
    if (ctaText) slide.ctaText = ctaText;
    if (ctaLink) slide.ctaLink = ctaLink;
    if (order !== undefined) slide.order = order;
    if (isActive !== undefined) slide.isActive = isActive;
    if (req.file) slide.image = req.file.path;

    await slide.save();
    logger.info(`Admin updated hero slide: ${slide._id}`);
    res.status(200).json({ status: 'success', data: { slide } });
});

exports.deleteSlide = catchAsync(async (req, res, next) => {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return next(new AppError('Slide not found', 404));
    logger.info(`Admin deleted hero slide: ${req.params.id}`);
    res.status(204).json({ status: 'success', data: null });
});
