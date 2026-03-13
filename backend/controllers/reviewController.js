const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookingId, rating, comment, images } = req.body;

    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user.id,
      booking: bookingId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      service: booking.service,
      booking: bookingId,
      rating,
      comment,
      images: images || []
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('service', 'title');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: populatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
exports.getServiceReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ service: req.params.serviceId });

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { service: new require('mongoose').Types.ObjectId(req.params.serviceId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      ratingDistribution,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('service', 'title category images')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    if (images) review.images = images;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('service', 'title');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recent reviews (for home page)
// @route   GET /api/reviews/recent
// @access  Public
exports.getRecentReviews = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const reviews = await Review.find({ rating: { $gte: 4 } })
      .populate('user', 'name avatar')
      .populate('service', 'title category')
      .sort('-createdAt')
      .limit(Number(limit));

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add provider response to review
// @route   POST /api/reviews/:id/response
// @access  Private (Provider only)
exports.addResponse = async (req, res) => {
  try {
    const { comment } = req.body;

    const review = await Review.findById(req.params.id).populate('service');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if the provider owns the service
    if (review.service.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    review.response = {
      comment,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
