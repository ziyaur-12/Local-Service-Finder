import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, IndianRupee, ChevronLeft } from 'lucide-react'
import { servicesAPI, bookingsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Booking = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [bookingData, setBookingData] = useState({
    bookingDate: '',
    timeSlot: {
      startTime: '10:00'
    },
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    description: '',
    location: {
      coordinates: [0, 0]
    }
  })

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await servicesAPI.getById(serviceId)
      setService(response.data.service)

      // Pre-fill address from user location if available
      if (user?.location) {
        setBookingData(prev => ({
          ...prev,
          address: {
            street: user.location.address || '',
            city: user.location.city || '',
            state: user.location.state || '',
            pincode: user.location.pincode || '',
            landmark: ''
          },
          location: {
            coordinates: user.location.coordinates || [0, 0]
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching service:', error)
      toast.error('Service not found')
      navigate('/services')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setBookingData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!bookingData.bookingDate) {
      toast.error('Please select a booking date')
      return
    }

    if (!bookingData.address.street || !bookingData.address.city || !bookingData.address.pincode) {
      toast.error('Please fill in the complete address')
      return
    }

    setSubmitting(true)

    try {
      await bookingsAPI.create({
        serviceId,
        ...bookingData
      })
      toast.success('Booking request sent successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = []
    const start = parseInt(service?.availability?.startTime?.split(':')[0] || 9)
    const end = parseInt(service?.availability?.endTime?.split(':')[0] || 18)

    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Book Service</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              {/* Date & Time */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Select Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={bookingData.bookingDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      required
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot *
                    </label>
                    <select
                      name="timeSlot.startTime"
                      value={bookingData.timeSlot.startTime}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {generateTimeSlots().map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Service Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={bookingData.address.street}
                      onChange={handleChange}
                      required
                      placeholder="House/Flat No., Street Name"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={bookingData.address.city}
                        onChange={handleChange}
                        required
                        placeholder="City"
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={bookingData.address.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={bookingData.address.pincode}
                        onChange={handleChange}
                        required
                        placeholder="Pincode"
                        pattern="[0-9]{6}"
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        name="address.landmark"
                        value={bookingData.address.landmark}
                        onChange={handleChange}
                        placeholder="Near..."
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  name="description"
                  value={bookingData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your requirements or any specific instructions..."
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Service Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">Booking Summary</h3>

              {/* Service Info */}
              <div className="flex items-start mb-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                  {service?.images?.[0] ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100">
                      <span className="text-primary-600 font-bold">
                        {service?.title?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-800">{service?.title}</h4>
                  <p className="text-sm text-gray-500">{service?.provider?.name}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <span className="text-gray-600">Service Price</span>
                <div className="flex items-center font-semibold text-gray-800">
                  <IndianRupee className="w-4 h-4" />
                  {service?.price}
                </div>
              </div>

              {/* Booking Details */}
              {bookingData.bookingDate && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-800">
                      {new Date(bookingData.bookingDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="text-gray-800">{bookingData.timeSlot.startTime}</span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="font-semibold text-gray-800">Total Amount</span>
                <div className="flex items-center text-xl font-bold text-primary-600">
                  <IndianRupee className="w-5 h-5" />
                  {service?.price}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                * Payment will be collected after service completion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
