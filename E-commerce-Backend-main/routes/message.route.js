const express = require('express');
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', messageController.sendMessage);

router.use(restrictTo('admin'));
router.get('/admin', messageController.getAllMessagesAdmin);
router.delete('/admin/:id', messageController.deleteMessageAdmin);

module.exports = router;
