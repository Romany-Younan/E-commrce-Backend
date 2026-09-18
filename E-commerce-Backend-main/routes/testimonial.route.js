const express = require('express');
const testimonialController = require('../controllers/testimonial.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/public', testimonialController.getPublicTestimonials);

router.get('/my', authMiddleware, testimonialController.getMyTestimonial);
router.post('/', authMiddleware, testimonialController.submitTestimonial);
router.patch('/:id/viewed', authMiddleware, testimonialController.markTestimonialViewed);
router.delete('/:id/cancel', authMiddleware, testimonialController.cancelMyTestimonial);
router.patch('/:id/update', authMiddleware, testimonialController.updateMyTestimonial);

router.use(authMiddleware, restrictTo('admin'));
router.route('/admin')
    .get(testimonialController.getAllTestimonialsAdmin);

router.patch('/admin/:id', testimonialController.updateTestimonialStatus);

module.exports = router;
