const express = require('express');
const router = express.Router();
const {addPurchase,getAllPurchases,getUserPurchases} = require('../controllers/purchase.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.get('/',authMiddleware,restrictTo('admin'),getAllPurchases);
router.get('/mypurchases',authMiddleware,restrictTo('user'),getUserPurchases);
router.post('/',authMiddleware,restrictTo('user'),addPurchase);

module.exports = router;
