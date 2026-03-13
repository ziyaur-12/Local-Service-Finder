import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Wrench, Zap, Droplets, GraduationCap, Car, Paintbrush, Sparkles, TreePine, Star, Shield, Clock, Users, ArrowRight, CheckCircle2, Quote, Phone, Play, Navigation, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ServiceCard from '../components/ServiceCard'
import { servicesAPI, reviewsAPI } from '../services/api'

const categories = [
  { id: 'electrician', name: 'Electrician', icon: Zap, color: 'from-amber-400 to-orange-500', emoji: '⚡' },
  { id: 'plumber', name: 'Plumber', icon: Droplets, color: 'from-blue-400 to-cyan-500', emoji: '🔧' },
  { id: 'carpenter', name: 'Carpenter', icon: Wrench, color: 'from-orange-400 to-red-500', emoji: '🪚' },
  { id: 'tutor', name: 'Tutor', icon: GraduationCap, color: 'from-emerald-400 to-teal-500', emoji: '📚' },
  { id: 'mechanic', name: 'Mechanic', icon: Car, color: 'from-rose-400 to-pink-500', emoji: '🚗' },
  { id: 'painter', name: 'Painter', icon: Paintbrush, color: 'from-violet-400 to-purple-500', emoji: '🎨' },
  { id: 'cleaner', name: 'Cleaner', icon: Sparkles, color: 'from-sky-400 to-blue-500', emoji: '🧹' },
  { id: 'gardener', name: 'Gardener', icon: TreePine, color: 'from-green-400 to-emerald-500', emoji: '🌿' }
]

const floatingCards = [
  { icon: '⚡', name: 'Electrician', rating: '4.9', price: '₹299', top: '5%', left: '0%' },
  { icon: '🔧', name: 'Plumber', rating: '4.8', price: '₹249', top: '5%', right: '0%' },
  { icon: '❄️', name: 'AC Repair', rating: '4.7', price: '₹399', bottom: '28%', left: '0%' },
  { icon: '📚', name: 'Tutor', rating: '4.9', price: '₹500', bottom: '8%', right: '0%' },
  { icon: '🎨', name: 'Painter', rating: '4.8', price: '₹350', top: '42%', left: '25%' },
]

const fallbackTestimonials = [
  { id: 1, name: 'Rahul Sharma', rating: 5, comment: 'Found an amazing electrician within minutes. The booking was smooth and service excellent!', service: { title: 'Electrical Repair', category: 'electrician' } },
  { id: 2, name: 'Priya Patel', rating: 5, comment: 'This platform is a lifesaver for busy professionals. Quick, reliable, and verified providers.', service: { title: 'Plumbing Service', category: 'plumber' } },
  { id: 3, name: 'Amit Kumar', rating: 5, comment: 'Found an excellent tutor for competitive exams. The rating system helped me choose wisely.', service: { title: 'Math Tuition', category: 'tutor' } }
]

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [userCoords, setUserCoords] = useState(null) // { lat, lng }
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [featuredServices, setFeaturedServices] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Auto-detect location on page load
  useEffect(() => {
    autoDetectLocation()
    fetchRecentReviews()
  }, [])

  // Fetch services when coordinates are available
  useEffect(() => {
    fetchFeaturedServices()
  }, [userCoords])

  // Auto-detect user's location on page load (silent - no toast)
  const autoDetectLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserCoords({ lat: latitude, lng: longitude })

        // Get city name for display
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          )
          const data = await response.json()
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || ''
          if (city) setLocation(city)
        } catch (err) {
          console.log('Could not get city name:', err)
        }
      },
      () => {
        // Silent fail - just fetch all services without location
        fetchFeaturedServices()
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    )
  }

  // Manual detect with toast feedback
  const detectUserLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
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
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || ''

          if (city) {
            setLocation(city)
            toast.success(`Location: ${city}`)
          } else {
            toast.error('Could not detect city name')
          }
        } catch (error) {
          toast.error('Failed to get city name')
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

  const fetchFeaturedServices = async () => {
    try {
      const params = { limit: 6, sort: '-rating.average' }
      // If user location is available, fetch nearby services (within 50km to show more results)
      if (userCoords) {
        params.lat = userCoords.lat
        params.lng = userCoords.lng
        params.radius = 50 // 50km radius to get enough results, nearby will be first due to $near
      }
      const response = await servicesAPI.getAll(params)
      setFeaturedServices(response.data.services)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentReviews = async () => {
    try {
      const response = await reviewsAPI.getRecentReviews({ limit: 3 })
      if (response.data.reviews?.length > 0) {
        setReviews(response.data.reviews)
      } else {
        setReviews(fallbackTestimonials)
      }
    } catch {
      setReviews(fallbackTestimonials)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    let url = `/services?search=${searchQuery}&city=${location}`
    // Pass coordinates for nearby search
    if (userCoords) {
      url += `&lat=${userCoords.lat}&lng=${userCoords.lng}&radius=10`
    }
    navigate(url)
  }

  return (
    <div className="overflow-hidden">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[92vh] flex items-center hero-gradient overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-[100px] animate-pulse-slow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center">

            {/* Left Content */}
            <div className="lg:col-span-3">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] backdrop-blur-md text-indigo-200 px-4 py-2 rounded-full text-sm font-medium mb-8">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Trusted by 10,000+ customers across India
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[2.75rem] sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6"
              >
                Find Expert
                <span className="block mt-1" style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Local Services
                </span>
                <span className="block">Near You</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed"
              >
                Connect with verified professionals — electricians, plumbers, tutors & more.
                Book trusted experts in minutes with real customer reviews.
              </motion.p>

              {/* Search Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSearch}
                className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-1.5 flex flex-col sm:flex-row gap-1 mb-6 shadow-2xl"
              >
                <div className="flex items-center gap-3 flex-1 px-4 py-3 sm:py-2.5">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div className="hidden sm:block w-px bg-white/[0.08] my-2" />
                <div className="flex items-center gap-2 flex-1 px-4 py-3 sm:py-2.5">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Your city..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-slate-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={detectUserLocation}
                    disabled={detectingLocation}
                    className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/20 hover:bg-indigo-500/30 px-2 py-1 rounded-lg transition-all whitespace-nowrap disabled:opacity-50"
                    title="Detect my location"
                  >
                    {detectingLocation ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{detectingLocation ? 'Detecting...' : 'Locate Me'}</span>
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-8 py-3.5 rounded-xl font-semibold whitespace-nowrap hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Search
                </motion.button>
              </motion.form>

              {/* Quick Tags */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-2 mb-10"
              >
                <span className="text-slate-500 text-sm">Popular:</span>
                {[{ e: '⚡', n: 'Electrician' }, { e: '🔧', n: 'Plumber' }, { e: '❄️', n: 'AC Repair' }, { e: '📚', n: 'Tutor' }].map(i => (
                  <Link
                    key={i.n}
                    to={`/services?search=${i.n}`}
                    className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-3 py-1.5 rounded-full transition-all"
                  >
                    <span>{i.e}</span>{i.n}
                  </Link>
                ))}
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-6"
              >
                {[
                  { icon: Shield, label: '200+ Verified' },
                  { icon: Star, label: '4.8 Rating' },
                  { icon: Users, label: '10K+ Users' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-slate-400 text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - Floating Cards */}
            <div className="hidden lg:block lg:col-span-2 relative h-[480px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/5 animate-pulse-slow" />
              </div>

              {floatingCards.map((card, i) => (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                  transition={{
                    opacity: { duration: 0.4, delay: 0.5 + i * 0.12 },
                    scale: { duration: 0.4, delay: 0.5 + i * 0.12 },
                    y: { duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }
                  }}
                  className="absolute bg-white/[0.08] backdrop-blur-lg border border-white/[0.12] rounded-2xl p-4 w-40 shadow-2xl"
                  style={{ top: card.top, left: card.left, right: card.right, bottom: card.bottom }}
                >
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <p className="text-white font-semibold text-sm">{card.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-xs font-bold">{card.rating}</span>
                  </div>
                  <p className="text-indigo-300 text-xs font-semibold mt-1">{card.price}/hr</p>
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full" style={{ width: `${80 + i * 4}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,80 L0,40 Q360,0 720,40 T1440,40 L1440,80 Z" className="fill-gray-50 dark:fill-slate-900" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: '500+', label: 'Services', icon: Wrench, gradient: 'from-indigo-500 to-violet-500' },
              { value: '200+', label: 'Providers', icon: Shield, gradient: 'from-emerald-500 to-teal-500' },
              { value: '10K+', label: 'Customers', icon: Users, gradient: 'from-orange-500 to-amber-500' },
              { value: '50+', label: 'Cities', icon: MapPin, gradient: 'from-pink-500 to-rose-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-card text-center group hover:shadow-card-hover hover:-translate-y-1 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-extrabold text-gray-800 dark:text-white">{stat.value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CATEGORIES ═══════════════════ */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-widest">Categories</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-3">Browse by Category</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">Find the right professional for any job</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/services?category=${cat.id}`}
                  className="group flex items-center gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">{cat.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">View all →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all">
              View all categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURED SERVICES ═══════════════════ */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-widest">Top Rated</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">Featured Services</h2>
            </motion.div>
            <Link to="/services" className="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-72 shimmer-bg border border-gray-100 dark:border-slate-700" />
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service, i) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              <div className="text-5xl mb-3">🛠️</div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No services yet. Be the first!</p>
              <Link to="/register" className="mt-4 inline-block text-primary-600 dark:text-primary-400 font-semibold hover:underline">Register as Provider</Link>
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/services" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3.5 rounded-xl font-semibold">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-3">3 Simple Steps</h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-900 dark:via-primary-600 dark:to-primary-900" />

            {[
              { num: '01', icon: Search, title: 'Search', desc: 'Find services by category, location or keyword' },
              { num: '02', icon: Clock, title: 'Book', desc: 'Choose provider, select time, confirm booking' },
              { num: '03', icon: CheckCircle2, title: 'Done', desc: 'Service completed, pay & leave review' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="inline-flex flex-col items-center justify-center w-28 h-28 bg-white dark:bg-slate-800 rounded-3xl border-2 border-primary-100 dark:border-primary-900 shadow-card mx-auto mb-6 relative z-10 group-hover:shadow-card-hover transition-shadow">
                  <span className="text-xs font-bold text-primary-400 mb-1">{step.num}</span>
                  <step.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-3">What Customers Say</h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <motion.div
                key={review._id || review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 p-7 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden group"
              >
                <div className="absolute -top-4 -right-2 text-[100px] font-serif text-primary-50 dark:text-slate-700 select-none">"</div>

                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed relative z-10">"{review.comment}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-slate-700">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {(review.user?.name || review.name)?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{review.user?.name || review.name}</p>
                    <p className="text-xs text-gray-400">{review.service?.title}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary-400 ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 70%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 pattern-grid" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 text-center relative z-10"
        >
          <span className="inline-block bg-white/10 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full border border-white/20 mb-6">
            For Service Providers
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Grow Your Business<br/>with LocalServices
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
            Join 200+ verified providers using our platform to connect with customers, manage bookings, and grow online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/services" className="inline-flex items-center gap-2 border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all">
                Browse Services
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Home
