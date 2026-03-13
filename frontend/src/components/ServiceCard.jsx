import { Link } from 'react-router-dom'
import { Star, MapPin, IndianRupee, Phone, CheckCircle2, ArrowRight } from 'lucide-react'

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
  other: 'from-gray-400 to-gray-500'
}

const priceLabels = {
  hourly: '/hr',
  fixed: '/visit',
  negotiable: ''
}

// Default tags by category
const defaultTags = {
  electrician: ['Wiring', 'AC Repair', 'Short Circuit', 'MCB'],
  plumber: ['Pipe Fitting', 'Leakage', 'Bathroom', 'Drainage'],
  carpenter: ['Furniture', 'Door Repair', 'Cabinet', 'Woodwork'],
  mechanic: ['Car Repair', 'Bike Service', 'Engine', 'Oil Change'],
  tutor: ['Maths', 'Science', 'English', 'Exam Prep'],
  painter: ['Wall Paint', 'Waterproof', 'Texture', 'Polish'],
  cleaner: ['Deep Clean', 'Kitchen', 'Bathroom', 'Sofa Clean'],
  gardener: ['Lawn Care', 'Trimming', 'Plantation', 'Maintenance'],
  ac_repair: ['AC Service', 'Gas Refill', 'Installation', 'Cleaning'],
  other: ['General', 'Maintenance', 'Repair']
}

const ServiceCard = ({ service }) => {
  const isAvailable = () => {
    const now = new Date()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[now.getDay()]
    return service.availability?.days?.includes(currentDay) !== false
  }

  const available = isAvailable()
  const tags = service.tags?.length > 0 ? service.tags : (defaultTags[service.category] || defaultTags.other)
  const gradient = categoryGradients[service.category] || categoryGradients.other

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      {/* Provider Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg text-2xl`}>
            {service.provider?.avatar ? (
              <img src={service.provider.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span>{categoryIcons[service.category] || '🛠️'}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 dark:text-white truncate">{service.provider?.name || 'Provider'}</h3>
              {service.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500 dark:text-gray-400">{categoryLabels[service.category] || service.category}</span>
              {service.location?.city && (
                <>
                  <span className="text-gray-300 dark:text-slate-600">•</span>
                  <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3 mr-0.5" />
                    {service.location.city}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating & Availability */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-4 h-4 ${star <= Math.round(service.rating?.average || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}`} />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{service.rating?.average?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">({service.rating?.count || 0})</span>
          </div>
          <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
            available
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {available ? 'Available now' : 'Busy today'}
          </span>
        </div>
      </div>

      {/* Service Title */}
      <div className="px-5 mt-3">
        <Link to={`/services/${service._id}`} className="text-primary-600 dark:text-primary-400 font-semibold text-sm hover:underline">
          {service.title}
        </Link>
      </div>

      {/* Tags */}
      <div className="px-5 mt-3 flex flex-wrap gap-1.5">
        {tags.slice(0, 4).map(tag => (
          <span key={tag} className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1 rounded-lg">
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5 mt-4 border-t border-gray-100 dark:border-slate-700"></div>

      {/* Price & Actions */}
      <div className="p-5 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-gray-800 dark:text-white" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">{service.price}</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">{priceLabels[service.priceType] || '/visit'}</span>
            </div>
          </div>
          <Link
            to={`/services/${service._id}`}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-1.5 group-hover:gap-2"
          >
            Book Now
            <ArrowRight className="w-3.5 h-3.5 transition-all" />
          </Link>
        </div>

        {/* Phone Number */}
        {service.provider?.phone && (
          <a
            href={`tel:+91${service.provider.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group/phone"
          >
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover/phone:bg-green-100 dark:group-hover/phone:bg-green-900/50 transition">
              <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span>+91 {service.provider.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">Call for price</span>
          </a>
        )}
      </div>
    </div>
  )
}

export default ServiceCard
