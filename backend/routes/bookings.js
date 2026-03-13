const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');

// Validation rules
const bookingValidation = [
  body('serviceId')
    .notEmpty().withMessage('Service ID is required'),
  body('bookingDate')
    .notEmpty().withMessage('Booking date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('timeSlot.startTime')
    .notEmpty().withMessage('Start time is required'),
  body('address.street')
    .notEmpty().withMessage('Street address is required'),
  body('address.city')
    .notEmpty().withMessage('City is required'),
  body('address.pincode')
    .notEmpty().withMessage('Pincode is required')
];

// All routes are protected
router.use(protect);

// User routes
router.post('/', authorize('user'), bookingValidation, createBooking);
router.get('/my', getMyBookings);
router.put('/:id/cancel', authorize('user'), cancelBooking);

// Provider routes
router.get('/provider', authorize('provider', 'admin'), getProviderBookings);
router.put('/:id/status', authorize('provider', 'admin'), updateBookingStatus);

// Common routes
router.get('/:id', getBooking);

module.exports = router;
