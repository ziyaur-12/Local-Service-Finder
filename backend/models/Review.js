const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  images: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: true
  },
  response: {
    comment: { type: String },
    respondedAt: { type: Date }
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews for same booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(serviceId) {
  const stats = await this.aggregate([
    { $match: { service: serviceId } },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Service').findByIdAndUpdate(serviceId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].totalReviews
    });
  } else {
    await mongoose.model('Service').findByIdAndUpdate(serviceId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
};

// Update service rating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.service);
});

// Update service rating after remove
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.service);
});

module.exports = mongoose.model('Review', reviewSchema);
