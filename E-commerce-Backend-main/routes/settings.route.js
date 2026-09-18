const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.route('/')
    .get(settingsController.getSettings)
    .patch(
        authMiddleware,
        roleMiddleware.restrictTo('admin'),
        settingsController.updateSettings
    );

module.exports = router;
