const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const {createBackUp,restoreDB} = require('../controllers/admin.controller')
const User = require('../models/user.model');
const catchAsync = require('../utilites/catchAsync.uti');

router.post('/backup',authMiddleware,restrictTo('admin'),createBackUp);
router.post('/restore',authMiddleware,restrictTo('admin'),restoreDB);

router.get('/users', authMiddleware, restrictTo('admin'), catchAsync(async (req, res) => {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ status: 'success', data: { users } });
}));

router.patch('/users/:id', authMiddleware, restrictTo('admin'), catchAsync(async (req, res) => {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found.' });
    res.status(200).json({ status: 'success', data: { user } });
}));

module.exports = router;