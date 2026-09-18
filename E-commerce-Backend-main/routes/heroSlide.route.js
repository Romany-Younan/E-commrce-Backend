const express = require('express');
const heroSlideController = require('../controllers/heroSlide.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const router = express.Router();

router.get('/', heroSlideController.getSlides);

router.use(authMiddleware, restrictTo('admin'));
router.get('/admin', heroSlideController.getAllSlidesAdmin);
router.post('/', upload.single('image'), heroSlideController.createSlide);
router.patch('/:id', upload.single('image'), heroSlideController.updateSlide);
router.delete('/:id', heroSlideController.deleteSlide);

module.exports = router;
