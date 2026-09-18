const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware')
const {getSalesReport} = require('../controllers/order.controller');

router.get('/sales',authMiddleware,restrictTo('admin'),getSalesReport);

module.exports = router;