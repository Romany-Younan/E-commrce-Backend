const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
    .get(restrictTo('user'), orderController.getMyOrders)
    .post(restrictTo('user'), orderController.createOrder);

router.get('/my/:id', restrictTo('user'), orderController.getMyOrderById);
router.patch('/:id/cancel', restrictTo('user'), orderController.cancelMyOrder);

router.use(restrictTo('admin'));

router.get('/admin', orderController.getAllOrdersAdmin);
router.patch('/admin/:id', orderController.updateOrderStatus);
router.get('/admin/sales-report', orderController.getSalesReport);

module.exports = router;
