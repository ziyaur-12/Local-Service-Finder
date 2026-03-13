const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { validationResult } = require('express-validator');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User only)
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { serviceId, bookingDate, timeSlot, address, description, location } = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This service is currently unavailable'
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      provider: service.provider,
      service: serviceId,
      bookingDate,
      timeSlot,
      address,
      description,
      location,
      totalAmount: service.price
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title category price')
      .populate('provider', 'name email phone')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('service', 'title category price images')
      .populate('provider', 'name email phone avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider only)
exports.getProviderBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { provider: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('service', 'title category price')
      .populate('user', 'name email phone avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title category price images')
      .populate('provider', 'name email phone avatar')
      .populate('user', 'name email phone avatar');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized
    if (
      booking.user._id.toString() !== req.user.id &&
      booking.provider._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update booking status (accept/reject)
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, providerNote } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if provider owns this booking
    if (booking.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: ['completed', 'cancelled'],
      rejected: [],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    booking.status = status;
    if (providerNote) booking.providerNote = providerNote;

    if (status === 'completed') {
      booking.completedAt = new Date();
      // Increment total bookings for the service
      await Service.findByIdAndUpdate(booking.service, {
        $inc: { totalBookings: 1 }
      });
    }

    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title category price')
      .populate('user', 'name email phone')
      .populate('provider', 'name email phone');

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel booking (by user)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Can only cancel pending or accepted bookings
    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    if (cancelReason) booking.cancelReason = cancelReason;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
