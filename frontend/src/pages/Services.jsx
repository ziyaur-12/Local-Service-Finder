import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, MapPin, Filter, Star, TrendingUp, IndianRupee, Clock, SlidersHorizontal, X, Navigation, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import ServiceCard from '../components/ServiceCard'
import { servicesAPI } from '../services/api'

const categories = [
  { id: '', name: 'All Categories' },
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

const quickFilters = [
  { id: 'top_rated', label: 'Top Rated', icon: Star, sort: '-rating.average' },
  { id: 'low_price', label: 'Low Price', icon: IndianRupee, sort: 'price' },
  { id: 'newest', label: 'Newest', icon: TrendingUp, sort: '-createdAt' },
]

// Skeleton card component
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-14 h-14 bg-gray-200 dark:bg-slate-700 rounded-xl flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="flex gap-1 mb-3">
      {[1,2,3,4].map(i => <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>)}
    </div>
    <div className="border-t border-gray-100 dark:border-slate-700 pt-3 flex justify-between items-center">
      <div className="h-7 w-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
      <div className="h-9 w-24 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
  </div>
)

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [activeQuickFilter, setActiveQuickFilter] = useState('')
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 })
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [userCoords, setUserCoords] = useState({
    lat: searchParams.get('lat') || null,
    lng: searchParams.get('lng') || null
  })

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || '-createdAt'
  })

  // Auto-detect location on mount if not already provided
  useEffect(() => {
    if (!userCoords.lat && !userCoords.lng) {
      silentLocationDetect()
    }
  }, [])

  // Silent location detection (no toast, just for nearby search)
  const silentLocationDetect = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserCoords({ lat: latitude, lng: longitude })
        // Get city name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          )
          const data = await response.json()
          const city = data.address?.city || data.address?.town || data.address?.village || ''
          if (city && !filters.city) {
            setFilters(prev => ({ ...prev, city }))
          }
        } catch {}
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    )
  }

  // Manual detect with toast feedback
  const detectUserLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by browser')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          setUserCoords({ lat: latitude, lng: longitude })
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          )
          const data = await response.json()
          const city = data.address?.city || data.address?.town || data.address?.village || ''
          if (city) {
            handleFilterChange('city', city)
            toast.success(`Location: ${city}`)
          } else {
            toast.error('Could not detect city')
          }
        } catch {
          toast.error('Failed to get location')
        } finally {
          setDetectingLocation(false)
        }
      },
      (error) => {
        setDetectingLocation(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied')
        } else {
          toast.error('Could not detect location')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  useEffect(() => {
    fetchServices()
  }, [searchParams, userCoords])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(searchParams.entries())
      params.page = params.page || 1
      params.limit = 12
      // Add coordinates for nearby search (50km radius to show enough results)
      if (userCoords.lat && userCoords.lng) {
        params.lat = userCoords.lat
        params.lng = userCoords.lng
        params.radius = params.radius || 50 // Default 50km, nearby first due to $near sorting
      }
      const response = await servicesAPI.getAll(params)
      setServices(response.data.services)
      setPagination({
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage
      })
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e?.preventDefault()
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    // Include coordinates
    if (userCoords.lat && userCoords.lng) {
      params.set('lat', userCoords.lat)
      params.set('lng', userCoords.lng)
      params.set('radius', '10') // 10km for search
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleQuickFilter = (qf) => {
    if (activeQuickFilter === qf.id) {
      setActiveQuickFilter('')
      const newFilters = { ...filters, sort: '-createdAt', rating: '' }
      setFilters(newFilters)
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => { if (value) params.set(key, value) })
      if (userCoords.lat) { params.set('lat', userCoords.lat); params.set('lng', userCoords.lng) }
      setSearchParams(params)
    } else {
      setActiveQuickFilter(qf.id)
      const newFilters = { ...filters, sort: qf.sort, rating: qf.id === 'top_rated' ? '4' : '' }
      setFilters(newFilters)
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => { if (value) params.set(key, value) })
      if (userCoords.lat) { params.set('lat', userCoords.lat); params.set('lng', userCoords.lng) }
      setSearchParams(params)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setActiveQuickFilter('')
    setFilters({ search: '', category: '', city: '', minPrice: '', maxPrice: '', rating: '', sort: '-createdAt' })
    // Keep coordinates for nearby search
    const params = new URLSearchParams()
    if (userCoords.lat) { params.set('lat', userCoords.lat); params.set('lng', userCoords.lng) }
    setSearchParams(params)
  }

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFiltersCount = [filters.category, filters.city, filters.minPrice, filters.maxPrice, filters.rating]
    .filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services, providers..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-0 focus:border-primary-500 outline-none bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 transition"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="City or area..."
                className="w-full pl-11 pr-24 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-0 focus:border-primary-500 outline-none bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 transition"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
              <button
                type="button"
                onClick={detectUserLocation}
                disabled={detectingLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
              >
                {detectingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                <span>{detectingLocation ? 'Detecting...' : 'Locate Me'}</span>
              </button>
            </div>
            <button type="submit" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-xl hover:shadow-lg transition font-semibold">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition font-medium ${
                showFilters || activeFiltersCount > 0
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFiltersCount}</span>
              )}
            </button>
          </form>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">Quick:</span>
            {quickFilters.map((qf) => (
              <button
                key={qf.id}
                onClick={() => handleQuickFilter(qf)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeQuickFilter === qf.id
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <qf.icon className="w-3.5 h-3.5" />
                {qf.label}
              </button>
            ))}
            {(activeFiltersCount > 0 || activeQuickFilter) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expandable Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100 dark:border-slate-700"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Min Price */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Min Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Max Price (₹)</label>
                    <input
                      type="number"
                      placeholder="5000"
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Min Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                    >
                      <option value="">Any</option>
                      <option value="4">4+ ⭐</option>
                      <option value="3">3+ ⭐</option>
                      <option value="2">2+ ⭐</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Sort By</label>
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                    >
                      <option value="-createdAt">Newest</option>
                      <option value="-rating.average">Top Rated</option>
                      <option value="price">Low Price</option>
                      <option value="-price">High Price</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleSearch} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium">
                    Apply Filters
                  </button>
                  <button onClick={clearFilters} className="border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition text-sm font-medium">
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nearby Providers</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {loading ? 'Searching...' : `${pagination.total} providers found`}
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🔍
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No providers found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try changing your search or filters</p>
            <button onClick={clearFilters} className="mt-4 text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition font-medium text-sm"
                >
                  ← Previous
                </button>
                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      pagination.currentPage === i + 1
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                        : 'border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition font-medium text-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Services
