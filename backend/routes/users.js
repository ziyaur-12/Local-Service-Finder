const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        location: user.location,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get providers
// @route   GET /api/users/providers
// @access  Public
router.get('/role/providers', async (req, res) => {
  try {
    const { city, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { role: 'provider', isActive: true };
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    const providers = await User.find(query)
      .select('name email avatar location isVerified createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: providers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
