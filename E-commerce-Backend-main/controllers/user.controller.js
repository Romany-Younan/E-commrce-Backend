const User = require('../models/user.model');
const catchAsync = require('../utilites/catchAsync.uti');
const AppError = require('../utilites/appError.uti');
const { logger } = require('../utilites/logger.uti');

exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError('User not found.', 404));
    }
    logger.info(`User profile fetched: ${user.mobile}`);
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    const filteredBody = {};
    const allowedFields = ['name', 'email', 'gender', 'emailConsent'];
    Object.keys(req.body).forEach(el => {
        if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    logger.info(`User profile updated: ${updatedUser.mobile}`);
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.currentPassword))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    logger.info(`User updated password: ${user.mobile}`);
    res.status(200).json({
        status: 'success',
        message: 'Password successfully updated'
    });
});