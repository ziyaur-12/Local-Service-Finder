import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, IndianRupee, Clock, Image } from 'lucide-react'
import { servicesAPI } from '../services/api'
import LocationPicker from '../components/LocationPicker'
import toast from 'react-hot-toast'

const categories = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'mechanic', name: 'Mechanic' },
  { id: 'tutor', name: 'Tutor' },
  { id: 'painter', name: 'Painter' },
  { id: 'cleaner', name: 'Cleaner' },
  { id: 'gardener', name: 'Gardener' },
  { id: 'ac_repair', name: 'AC Repair' },
  { id: 'appliance_repair', name: 'Appliance Repair' },
  { id: 'pest_control', name: 'Pest Control' },
  { id: 'moving_packing', name: 'Moving & Packing' },
  { id: 'beauty_salon', name: 'Beauty & Salon' },
  { id: 'fitness_trainer', name: 'Fitness Trainer' },
  { id: 'photographer', name: 'Photographer' },
  { id: 'event_planner', name: 'Event Planner' },
  { id: 'other', name: 'Other' }
]

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const AddService = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    priceType: 'fixed',
    location: {
      coordinates: [0, 0],
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    serviceRadius: 10,
    availability: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      startTime: '09:00',
      endTime: '18:00'
    },
    images: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter(d => d !== day)
          : [...prev.availability.days, day]
      }
    }))
  }

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: {
        coordinates: [location.lng, location.lat],
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        pincode: location.pincode || ''
      }
    }))
    setShowLocationPicker(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.location.city) {
      toast.error('Please select a location')
      return
    }

    setLoading(true)

    try {
      await servicesAPI.create({
        ...formData,
        price: Number(formData.price)
      })
      toast.success('Service created successfully!')
      navigate('/provider/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service')
    } finally {
      setLoading(false)
    }
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

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Service</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Professional Electrician Services"
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describe your service in detail..."
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <IndianRupee className="w-5 h-5 mr-2 text-primary-600" />
                Pricing
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="500"
                      className="w-full pl-10 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Type
                  </label>
                  <select
                    name="priceType"
                    value={formData.priceType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Per Hour</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Location
              </h3>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-primary-500 hover:text-primary-600 transition"
                >
                  {formData.location.city ? (
                    <span>
                      {formData.location.address ? `${formData.location.address}, ` : ''}
                      {formData.location.city}
                      {formData.location.state ? `, ${formData.location.state}` : ''}
                    </span>
                  ) : (
                    'Click to select location on map'
                  )}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      required
                      placeholder="Mumbai"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Radius (km)
                    </label>
                    <input
                      type="number"
                      name="serviceRadius"
                      value={formData.serviceRadius}
                      onChange={handleChange}
                      min="1"
                      max="50"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-600" />
                Availability
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1 rounded-full text-sm capitalize transition ${
                          formData.availability.days.includes(day)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="availability.startTime"
                      value={formData.availability.startTime}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="availability.endTime"
                      value={formData.availability.endTime}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Service...' : 'Create Service'}
            </button>
          </form>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          onSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  )
}

export default AddService
