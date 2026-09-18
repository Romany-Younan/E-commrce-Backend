const AppError = require('../utilites/appError.uti');
const { MAX_FILE_SIZE_MB } = require('./upload.middleware');
const { logger } = require('../utilites/logger.uti');

const normalizeError = (err) => {
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return new AppError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB`, 400);
        }
        return new AppError(err.message, 400);
    }
    return err;
};

module.exports = (err, req, res, next) => {
    err = normalizeError(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    const isClientError = err.statusCode >= 400 && err.statusCode < 500;
    const logLine = `Error | ${req.method} | ${req.originalUrl} : ${err.message}`;

    if (isClientError) {
        logger.warn(logLine);
    } else {
        logger.error(logLine, { stack: err.stack, statusCode: err.statusCode });
    }

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({ status: err.status, message: err.message });
    }

    res.status(500).json({
        status: 'error',
        message: 'something went wrong'
    });
};
