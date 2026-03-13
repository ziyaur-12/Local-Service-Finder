const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  getMyServices,
  getServicesByCategory
} = require('../controllers/serviceController');

// Validation rules
const serviceValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number'),
  body('location.city')
    .notEmpty().withMessage('City is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]')
];

// Public routes
router.get('/', getServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getService);

// Protected routes
router.post('/', protect, authorize('provider', 'admin'), serviceValidation, createService);
router.get('/provider/me', protect, authorize('provider', 'admin'), getMyServices);
router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
