const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createReview,
  getServiceReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  addResponse,
  getRecentReviews
} = require('../controllers/reviewController');

// Validation rules
const reviewValidation = [
  body('bookingId')
    .notEmpty().withMessage('Booking ID is required'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
];

// Public routes
router.get('/recent', getRecentReviews);
router.get('/service/:serviceId', getServiceReviews);

// Protected routes
router.use(protect);

router.post('/', reviewValidation, createReview);
router.get('/my', getMyReviews);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/response', authorize('provider'), addResponse);

module.exports = router;
