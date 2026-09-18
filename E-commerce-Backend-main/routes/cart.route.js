const express = require('express');
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware.restrictTo('user'));

router.route('/')
    .get(cartController.getCart)
    .post(cartController.addItem);

router.post('/sync', cartController.syncGuestCart);

router.route('/:id')
    .patch(cartController.updateQuantity)
    .delete(cartController.removeItem);

module.exports = router;
