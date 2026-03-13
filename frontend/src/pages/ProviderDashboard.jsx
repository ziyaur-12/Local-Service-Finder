import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Calendar, Clock, MapPin, IndianRupee, Star, Check, X, Eye, Trash2, TrendingUp, Users, Package, Briefcase } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { servicesAPI, bookingsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const ProviderDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    acceptedBookings: 0,
    totalServices: 0,
    totalEarnings: 0
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'bookings') {
        const response = await bookingsAPI.getProviderBookings({})
        setBookings(response.data.bookings)

        const pending = response.data.bookings.filter(b => b.status === 'pending').length
        const completed = response.data.bookings.filter(b => b.status === 'completed').length
        const accepted = response.data.bookings.filter(b => b.status === 'accepted').length
        const earnings = response.data.bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

        setStats(prev => ({
          ...prev,
          totalBookings: response.data.total,
          pendingBookings: pending,
          completedBookings: completed,
          acceptedBookings: accepted,
          totalEarnings: earnings
        }))
      } else {
        const response = await servicesAPI.getMyServices()
        setServices(response.data.services)
        setStats(prev => ({ ...prev, totalServices: response.data.count }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (bookingId, status) => {
    try {
      await bookingsAPI.updateStatus(bookingId, { status })
      toast.success(`Booking ${status} successfully`)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} booking`)
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await servicesAPI.delete(serviceId)
      toast.success('Service deleted successfully')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service')
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

  // Chart data
  const chartData = {
    labels: ['Pending', 'Accepted', 'Completed'],
    datasets: [{
      label: 'Bookings',
      data: [stats.pendingBookings, stats.acceptedBookings, stats.completedBookings],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
      borderRadius: 8,
      barThickness: 40
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  }

  // Loading skeleton
  const BookingSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-start">
        <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
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
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Provider Dashboard</h1>
              <p className="text-indigo-100 mt-1">Welcome back, {user?.name}!</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/provider/add-service"
                className="inline-flex items-center bg-white text-indigo-600 px-5 py-2.5 rounded-xl hover:shadow-lg transition font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Service
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Bookings', value: stats.totalBookings, icon: Package, color: 'from-blue-500 to-blue-600' },
            { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'from-yellow-500 to-orange-500' },
            { label: 'Completed', value: stats.completedBookings, icon: Check, color: 'from-green-500 to-green-600' },
            { label: 'Total Earnings', value: `₹${stats.totalEarnings}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600' }
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

        {/* Chart and Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Booking Statistics</h3>
            <div className="h-64">
              {stats.totalBookings > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  No booking data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-gray-600 dark:text-gray-300">My Services</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">{stats.totalServices}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-600 dark:text-gray-300">Accepted</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">{stats.acceptedBookings}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-300">Success Rate</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">
                  {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                </span>
              </div>
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
              Bookings
              {activeTab === 'bookings' && (
                <motion.div layoutId="providerActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-4 text-center font-medium transition relative ${
                activeTab === 'services'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Services
              {activeTab === 'services' && (
                <motion.div layoutId="providerActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
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
                <p className="text-gray-500 dark:text-gray-400 mt-2">Add services to start receiving bookings</p>
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
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                        {booking.user?.name?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {booking.user?.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Service: {booking.service?.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
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

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <div className="flex items-center text-lg font-bold text-gray-800 dark:text-white">
                        <IndianRupee className="w-4 h-4" />
                        {booking.totalAmount}
                      </div>

                      {/* Actions */}
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBookingAction(booking._id, 'accepted')}
                            className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:shadow-md transition"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBookingAction(booking._id, 'rejected')}
                            className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:shadow-md transition"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </motion.button>
                        </div>
                      )}
                      {booking.status === 'accepted' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBookingAction(booking._id, 'completed')}
                          className="flex items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:shadow-md transition"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Mark Complete
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Phone: <span className="text-gray-800 dark:text-gray-200 font-medium">{booking.user?.phone || 'N/A'}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Email: <span className="text-gray-800 dark:text-gray-200 font-medium">{booking.user?.email}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Address: <span className="text-gray-800 dark:text-gray-200 font-medium">
                        {booking.address?.street}, {booking.address?.city} - {booking.address?.pincode}
                      </span>
                    </span>
                  </div>

                  {booking.description && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Customer Note: </span>
                        {booking.description}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {services.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-slate-700"
              >
                <Plus className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">No services added</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Create your first service listing</p>
                <Link
                  to="/provider/add-service"
                  className="inline-block mt-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Add Service
                </Link>
              </motion.div>
            ) : (
              services.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start">
                      <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        {service.images?.[0] ? (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                            <span className="text-primary-600 dark:text-primary-400 font-bold text-2xl">
                              {service.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white">{service.title}</h3>
                        <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded text-sm mt-1 capitalize">
                          {service.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-gray-700 dark:text-gray-300">{service.rating?.average?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">({service.rating?.count || 0})</span>
                          <span className="mx-2 text-gray-300 dark:text-slate-600">|</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">{service.totalBookings || 0} bookings</span>
                        </div>
                        <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{service.location?.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center text-xl font-bold text-primary-600 dark:text-primary-400">
                        <IndianRupee className="w-5 h-5" />
                        {service.price}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2 mt-2">
                        <Link
                          to={`/services/${service._id}`}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProviderDashboard
