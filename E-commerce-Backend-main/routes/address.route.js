const express = require('express');
const addressController = require('../controllers/address.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
    .get(addressController.getAllAddresses)
    .post(addressController.createAddress);

router.route('/:id')
    .patch(addressController.updateAddress)
    .delete(addressController.deleteAddress);

module.exports = router;
