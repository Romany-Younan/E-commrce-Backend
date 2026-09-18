const Address = require('../models/address.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.getAllAddresses = catchAsync(async (req, res, next) => {
    const addresses = await Address.find({ userId: req.user.id });

    logger.info(`User ${req.user.id} fetched addresses`);
    res.status(200).json({
        status: 'success',
        results: addresses.length,
        data: {
            addresses
        }
    });
});

exports.createAddress = catchAsync(async (req, res, next) => {
    const { label, addressText, isDefault } = req.body;

    if (isDefault) {
        await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const newAddress = await Address.create({
        userId: req.user.id,
        label,
        addressText,
        isDefault
    });

    const allAddresses = await Address.find({ userId: req.user.id });
    if (allAddresses.length === 1 && !isDefault) {
        newAddress.isDefault = true;
        await newAddress.save();
    }

    logger.info(`User ${req.user.id} created address: ${label}`);
    res.status(201).json({
        status: 'success',
        data: {
            address: newAddress
        }
    });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
    const { label, addressText, isDefault } = req.body;

    const address = await Address.findOne({ _id: req.params.id, userId: req.user.id });
    if (!address) {
        return next(new AppError('No address found with that ID', 404));
    }

    if (isDefault) {
        await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    address.label = label || address.label;
    address.addressText = addressText || address.addressText;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();

    logger.info(`User ${req.user.id} updated address: ${req.params.id}`);
    res.status(200).json({
        status: 'success',
        data: {
            address
        }
    });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    
    if (!address) {
        return next(new AppError('No address found with that ID', 404));
    }

    if (address.isDefault) {
        const remainingAddress = await Address.findOne({ userId: req.user.id });
        if (remainingAddress) {
            remainingAddress.isDefault = true;
            await remainingAddress.save();
        }
    }

    logger.info(`User ${req.user.id} deleted address: ${req.params.id}`);
    res.status(204).json({
        status: 'success',
        data: null
    });
});
