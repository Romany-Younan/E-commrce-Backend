const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.patch('/updateMyPassword', userController.updateMyPassword);

module.exports = router;
