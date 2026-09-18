const express = require('express');
const refundController = require('../controllers/refund.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', refundController.requestRefund);

router.get('/admin', restrictTo('admin'), refundController.getAllRefundsAdmin);
router.patch('/admin/:id', restrictTo('admin'), refundController.updateRefundStatus);

module.exports = router;
