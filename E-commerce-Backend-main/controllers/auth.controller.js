const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utilites/appError.uti');
const catchAsync = require('../utilites/catchAsync.uti');
const { logger } = require('../utilites/logger.uti');

const signToken = user => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.SECRET_KEY || 'fallback_secret',
        { expiresIn: '7d' }
    );
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.register = catchAsync(async (req, res, next) => {
    const { name, mobile, email, password, gender, emailConsent, termsAccepted } = req.body;

    if (!termsAccepted) {
        return next(new AppError('You must accept the terms and conditions.', 400));
    }

    try {
        const newUser = await User.create({
            name,
            mobile,
            email,
            password,
            gender,
            emailConsent,
            termsAccepted,
            termsAcceptedAt: Date.now()
        });

        logger.info(`New user registered with mobile: ${mobile}`);
        createSendToken(newUser, 201, res);
    } catch (err) {
        if (err.code === 11000) {
            return next(new AppError('This mobile number or email is already registered.', 400));
        }
        throw err; // Let catchAsync handle it
    }
});

exports.login = catchAsync(async (req, res, next) => {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
        return next(new AppError('Please provide mobile and password!', 400));
    }

    const user = await User.findOne({ mobile }).select('+password +loginAttempts +lockUntil');

    if (!user) {
        return next(new AppError('Incorrect mobile number or password', 401));
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
        return next(new AppError('Account locked due to multiple failed login attempts. Please try again in 15 minutes.', 429));
    }

    if (!(await user.correctPassword(password))) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins
            user.loginAttempts = 0;
            await user.save({ validateBeforeSave: false });
            return next(new AppError('Account locked due to multiple failed login attempts. Please try again in 15 minutes.', 429));
        }
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Incorrect mobile number or password', 401));
    }

    if (user.lockUntil || user.loginAttempts > 0) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save({ validateBeforeSave: false });
    }

    if (!user.isActive) {
        return next(new AppError('Your account has been deactivated.', 401));
    }

    logger.info(`User logged in: ${mobile}`);
    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { mobile, newPassword } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
        return next(new AppError('No account found with this mobile number.', 404));
    }

    user.password = newPassword;
    await user.save();

    logger.info(`User reset password: ${mobile}`);
    res.status(200).json({
        status: 'success',
        message: 'Password successfully updated.'
    });
});