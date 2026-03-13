import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, MapPin, Clock, Phone, Mail, IndianRupee, ChevronLeft, CheckCircle2, Calendar, Shield, Award, MessageSquare, ArrowRight, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { servicesAPI, reviewsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const categoryLabels = {
  electrician: 'Electrician', plumber: 'Plumber', carpenter: 'Carpenter',
  mechanic: 'Mechanic', tutor: 'Tutor', painter: 'Painter', cleaner: 'Cleaner',
  gardener: 'Gardener', ac_repair: 'AC Repair', appliance_repair: 'Appliance Repair',
  pest_control: 'Pest Control', moving_packing: 'Moving & Packing',
  beauty_salon: 'Beauty & Salon', fitness_trainer: 'Fitness Trainer',
  photographer: 'Photographer', event_planner: 'Event Planner', other: 'Other'
}

const categoryIcons = {
  electrician: '⚡', plumber: '🔧', carpenter: '🪚', mechanic: '🔩',
  tutor: '📚', painter: '🎨', cleaner: '🧹', gardener: '🌿',
  ac_repair: '❄️', appliance_repair: '🔌', pest_control: '🐛',
  moving_packing: '📦', beauty_salon: '💇', fitness_trainer: '💪',
  photographer: '📷', event_planner: '🎉', other: '🛠️'
}

const categoryGradients = {
  electrician: 'from-yellow-400 to-orange-500',
  plumber: 'from-blue-400 to-cyan-500',
  carpenter: 'from-orange-400 to-red-500',
  mechanic: 'from-red-400 to-pink-500',
  tutor: 'from-green-400 to-emerald-500',
  painter: 'from-purple-400 to-violet-500',
  cleaner: 'from-cyan-400 to-blue-500',
  gardener: 'from-emerald-400 to-green-600',
  ac_repair: 'from-sky-400 to-blue-500',
  appliance_repair: 'from-amber-400 to-orange-500',
  pest_control: 'from-lime-400 to-green-500',
  moving_packing: 'from-slate-400 to-gray-500',
  beauty_salon: 'from-pink-400 to-rose-500',
  fitness_trainer: 'from-orange-400 to-red-500',
  photographer: 'from-violet-400 to-purple-500',
  event_planner: 'from-fuchsia-400 to-pink-500',
  other: 'from-gray-400 to-gray-500'
}

// Skeleton loader
const SkeletonDetail = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-slate-900 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl h-80 shadow-sm"></div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm space-y-4 h-96"></div>
        </div>
      </div>
    </div>
  </div>
)

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    fetchServiceDetails()
  }, [id])

  const fetchServiceDetails = async () => {
    try {
      const [serviceRes, reviewsRes] = await Promise.all([
        servicesAPI.getById(id),
        reviewsAPI.getServiceReviews(id, { limit: 10 })
      ])
      setService(serviceRes.data.service)
      setReviews(reviewsRes.data.reviews)
    } catch (error) {
      console.error('Error fetching service:', error)
      toast.error('Service not found')
      navigate('/services')
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a service')
      navigate('/login')
      return
    }
    navigate(`/booking/${id}`)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  if (loading) return <SkeletonDetail />
  if (!service) return null

  const gradient = categoryGradients[service.category] || categoryGradients.other
  const icon = categoryIcons[service.category] || '🛠️'

  const isAvailableToday = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = days[new Date().getDay()]
    return service.availability?.days?.includes(today) !== false
  }
  const availableToday = isAvailableToday()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image / Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="h-72 sm:h-96 relative">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[activeImage]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <div className="text-center">
                      <div className="text-8xl mb-3">{icon}</div>
                      <p className="text-white/80 font-medium text-lg">{categoryLabels[service.category]}</p>
                    </div>
                  </div>
                )}
                {/* Share button overlay */}
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              {service.images && service.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {service.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                        activeImage === index ? 'border-primary-600' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Service Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium mb-3">
                    {categoryLabels[service.category] || service.category}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{service.title}</h1>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center justify-end text-2xl font-bold text-gray-800 dark:text-white">
                    <IndianRupee className="w-5 h-5" />
                    {service.price}
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {service.priceType === 'hourly' ? 'per hour' : service.priceType === 'negotiable' ? 'negotiable' : 'per visit'}
                  </span>
                </div>
              </div>

              {/* Rating + Bookings */}
              <div className="flex items-center flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-5 h-5 ${star <= Math.round(service.rating?.average || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{service.rating?.average?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">({service.rating?.count || 0} reviews)</span>
                </div>
                <span className="text-gray-300 dark:text-slate-600">•</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{service.totalBookings || 0} bookings completed</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${availableToday ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${availableToday ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {availableToday ? 'Available today' : 'Busy today'}
                </span>
              </div>

              {/* Location & Time */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{service.location?.address ? `${service.location.address}, ` : ''}{service.location?.city}{service.location?.state ? `, ${service.location.state}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>Working hours: {service.availability?.startTime || '09:00'} – {service.availability?.endTime || '18:00'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">About This Service</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">{service.description}</p>
              </div>

              {/* Tags */}
              {service.tags && service.tags.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Days */}
              {service.availability?.days && service.availability.days.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Available Days</h3>
                  <div className="flex flex-wrap gap-2">
                    {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
                      const active = service.availability.days.includes(day)
                      return (
                        <span key={day} className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium ${active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-600 line-through'}`}>
                          {day.slice(0, 3)}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Service Radius */}
              {service.serviceRadius && (
                <div className="mt-5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-primary-500" />
                  Service available within {service.serviceRadius} km radius
                </div>
              )}
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Customer Reviews</h3>
                <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-sm">{reviews.length}</span>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, i) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-100 dark:border-slate-700 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold text-sm">{review.user?.name?.charAt(0)?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 dark:text-white">{review.user?.name}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex mt-1 gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}`} />
                            ))}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">{review.comment}</p>

                          {review.response?.comment && (
                            <div className="mt-3 bg-gray-50 dark:bg-slate-700/50 border-l-4 border-primary-400 px-4 py-3 rounded-r-xl">
                              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">Provider Response</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{review.response.comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="sticky top-24 space-y-4"
            >
              {/* Booking Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Price Header */}
                <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">Starting from</p>
                      <div className="flex items-center gap-1 mt-1">
                        <IndianRupee className="w-6 h-6" />
                        <span className="text-3xl font-bold">{service.price}</span>
                        <span className="text-white/80 text-sm mt-1">
                          {service.priceType === 'hourly' ? '/hr' : service.priceType === 'negotiable' ? '' : '/visit'}
                        </span>
                      </div>
                    </div>
                    <div className="text-4xl">{icon}</div>
                  </div>
                  {service.priceType === 'negotiable' && (
                    <p className="text-white/80 text-xs mt-1">Price negotiable - contact provider</p>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {/* Book Now Button */}
                  <button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all font-semibold flex items-center justify-center gap-2 group"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Call Button */}
                  {service.provider?.phone && (
                    <a
                      href={`tel:+91${service.provider.phone}`}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition"
                    >
                      <Phone className="w-4 h-4" />
                      Call Provider
                      <span className="text-sm font-normal">+91 {service.provider.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</span>
                    </a>
                  )}

                  {/* Email Button */}
                  {service.provider?.email && (
                    <a
                      href={`mailto:${service.provider.email}`}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      <Mail className="w-4 h-4" />
                      {service.provider.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Provider Profile Card */}
              {service.provider && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5"
                >
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-500" />
                    About the Provider
                  </h4>

                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md text-2xl`}>
                      {service.provider.avatar ? (
                        <img src={service.provider.avatar} alt={service.provider.name} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <span>{icon}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-800 dark:text-white">{service.provider.name}</p>
                        {service.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{categoryLabels[service.category]} Expert</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(service.rating?.average || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}`} />
                        ))}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{service.rating?.average?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {service.provider.phone && (
                      <a href={`tel:+91${service.provider.phone}`} className="flex items-center gap-3 text-sm group">
                        <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition">
                          <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Phone</p>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">+91 {service.provider.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</p>
                        </div>
                      </a>
                    )}
                    {service.provider.email && (
                      <a href={`mailto:${service.provider.email}`} className="flex items-center gap-3 text-sm group">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition">
                          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
                          <p className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[180px]">{service.provider.email}</p>
                        </div>
                      </a>
                    )}
                    {service.location?.city && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Location</p>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">{service.location.city}{service.location.state ? `, ${service.location.state}` : ''}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-gray-800 dark:text-white">{service.totalBookings || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bookings</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-gray-800 dark:text-white">{service.rating?.average?.toFixed(1) || '0.0'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rating</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Safety Badge */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Safe Booking</p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">All providers are reviewed. Book with confidence.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail
