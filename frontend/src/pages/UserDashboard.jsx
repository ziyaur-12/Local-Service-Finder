import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, IndianRupee, Star, X, Check, AlertCircle, TrendingUp, Package, CheckCircle2, XCircle } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { bookingsAPI, reviewsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend)

const UserDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'bookings') {
        const response = await bookingsAPI.getMyBookings({})
        setBookings(response.data.bookings)
      } else {
        const response = await reviewsAPI.getMyReviews()
        setReviews(response.data.reviews)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await bookingsAPI.cancel(bookingId, { cancelReason: 'Cancelled by user' })
      toast.success('Booking cancelled successfully')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const openReviewModal = (booking) => {
    setSelectedBooking(booking)
    setReviewData({ rating: 5, comment: '' })
    setShowReviewModal(true)
  }

  const submitReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    try {
      await reviewsAPI.create({
        bookingId: selectedBooking._id,
        rating: reviewData.rating,
        comment: reviewData.comment
      })
      toast.success('Review submitted successfully')
      setShowReviewModal(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  }

  // Chart data
  const chartData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [{
      data: [stats.completed, stats.pending, stats.cancelled],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      cutout: '70%'
    }]
  }

  const chartOptions = {
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false
  }

  // Loading skeleton component
  const BookingSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-start">
        <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="ml-4 flex-1">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100 mt-1">Manage your bookings and reviews from your dashboard</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Bookings', value: stats.total, icon: Package, color: 'from-blue-500 to-blue-600' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-orange-500' },
            { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'from-red-500 to-red-600' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Booking Overview</h3>
            <div className="h-48 relative">
              {stats.total > 0 ? (
                <Doughnut data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No booking data
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {[
                { label: 'Completed', color: 'bg-green-500' },
                { label: 'Pending', color: 'bg-yellow-500' },
                { label: 'Cancelled', color: 'bg-red-500' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/services" className="group p-4 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl hover:shadow-md transition-all border border-primary-100 dark:border-primary-800">
                <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-800 dark:text-white">Browse Services</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find new services</p>
              </Link>
              <Link to="/profile" className="group p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:shadow-md transition-all border border-purple-100 dark:border-purple-800">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-800 dark:text-white">Update Profile</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Edit your details</p>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-700">
          <div className="flex border-b border-gray-100 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-4 text-center font-medium transition relative ${
                activeTab === 'bookings'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Bookings
              {activeTab === 'bookings' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 text-center font-medium transition relative ${
                activeTab === 'reviews'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Reviews
              {activeTab === 'reviews' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <BookingSkeleton key={i} />)}
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-slate-700"
              >
                <Calendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">No bookings yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Start by finding a service</p>
                <Link
                  to="/services"
                  className="inline-block mt-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Browse Services
                </Link>
              </motion.div>
            ) : (
              bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-start">
                      <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        {booking.service?.images?.[0] ? (
                          <img
                            src={booking.service.images[0]}
                            alt={booking.service.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                            <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">
                              {booking.service?.title?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {booking.service?.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Provider: {booking.provider?.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {booking.timeSlot?.startTime}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.address?.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <div className="flex items-center justify-end mt-2 text-lg font-bold text-gray-800 dark:text-white">
                        <IndianRupee className="w-4 h-4" />
                        {booking.totalAmount}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 mt-3">
                        {['pending', 'accepted'].includes(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          >
                            Cancel
                          </button>
                        )}
                        {booking.status === 'completed' && !booking.hasReview && (
                          <button
                            onClick={() => openReviewModal(booking)}
                            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:shadow-md transition"
                          >
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {booking.providerNote && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Provider Note: </span>
                        {booking.providerNote}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-slate-700"
              >
                <Star className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">No reviews yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Complete a booking to leave a review</p>
              </motion.div>
            ) : (
              reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {review.service?.title}
                      </h3>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-3">{review.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Write a Review</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Review for: <span className="font-medium text-gray-800 dark:text-white">{selectedBooking?.service?.title}</span>
              </p>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  placeholder="Share your experience..."
                  className="w-full border-2 border-gray-200 dark:border-slate-600 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl hover:shadow-lg font-medium transition"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard
