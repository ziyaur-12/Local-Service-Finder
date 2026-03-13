import { useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { X, MapPin, Search, Crosshair, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const containerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777 // Mumbai
}

const LocationPicker = ({ onSelect, onClose, initialLocation }) => {
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [useManualInput, setUseManualInput] = useState(false)

  const [address, setAddress] = useState(initialLocation?.address || '')
  const [city, setCity] = useState(initialLocation?.city || '')
  const [state, setState] = useState(initialLocation?.state || '')
  const [pincode, setPincode] = useState(initialLocation?.pincode || '')
  const [lat, setLat] = useState(initialLocation?.coordinates?.[1] || defaultCenter.lat)
  const [lng, setLng] = useState(initialLocation?.coordinates?.[0] || defaultCenter.lng)
  const [fetchingPincode, setFetchingPincode] = useState(false)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Auto-detect location from pincode
  const fetchLocationFromPincode = async (pincodeValue) => {
    if (pincodeValue.length !== 6) return

    setFetchingPincode(true)
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincodeValue}`)
      const data = response.data

      if (data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0]
        setCity(postOffice.District || postOffice.Division)
        setState(postOffice.State)
        setAddress(`${postOffice.Name}, ${postOffice.Block || postOffice.Division}, ${postOffice.District}`)
        toast.success(`Location found: ${postOffice.District}, ${postOffice.State}`)
      } else {
        toast.error('Invalid pincode. Please check and try again.')
      }
    } catch (error) {
      toast.error('Could not fetch location. Please enter manually.')
    } finally {
      setFetchingPincode(false)
    }
  }

  const handlePincodeChange = (value) => {
    // Only allow numbers, max 6 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setPincode(cleaned)

    // Auto-fetch when 6 digits entered
    if (cleaned.length === 6) {
      fetchLocationFromPincode(cleaned)
    }
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  })

  const onLoad = useCallback((map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const reverseGeocode = async (latitude, longitude) => {
    if (!window.google) return

    const geocoder = new window.google.maps.Geocoder()
    const latlng = { lat: latitude, lng: longitude }

    try {
      const response = await geocoder.geocode({ location: latlng })
      if (response.results[0]) {
        const result = response.results[0]
        const addressComponents = result.address_components

        let cityName = ''
        let stateName = ''
        let pincodeVal = ''

        addressComponents.forEach((component) => {
          if (component.types.includes('locality')) {
            cityName = component.long_name
          }
          if (component.types.includes('administrative_area_level_1')) {
            stateName = component.long_name
          }
          if (component.types.includes('postal_code')) {
            pincodeVal = component.long_name
          }
        })

        setAddress(result.formatted_address)
        setCity(cityName)
        setState(stateName)
        setPincode(pincodeVal)
        setLat(latitude)
        setLng(longitude)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleMapClick = (e) => {
    const latitude = e.latLng.lat()
    const longitude = e.latLng.lng()
    setMarker({ lat: latitude, lng: longitude })
    reverseGeocode(latitude, longitude)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || !window.google) return

    setLoading(true)
    const geocoder = new window.google.maps.Geocoder()

    try {
      const response = await geocoder.geocode({ address: searchQuery + ', India' })
      if (response.results[0]) {
        const location = response.results[0].geometry.location
        const latitude = location.lat()
        const longitude = location.lng()

        setMarker({ lat: latitude, lng: longitude })
        map?.panTo({ lat: latitude, lng: longitude })
        map?.setZoom(15)
        reverseGeocode(latitude, longitude)
      }
    } catch (error) {
      toast.error('Location not found')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        setMarker({ lat: latitude, lng: longitude })
        map?.panTo({ lat: latitude, lng: longitude })
        map?.setZoom(15)
        reverseGeocode(latitude, longitude)
        setLoading(false)
      },
      () => {
        toast.error('Unable to get your location')
        setLoading(false)
      }
    )
  }

  const handleConfirm = () => {
    if (!city.trim()) {
      toast.error('Please enter city name')
      return
    }
    onSelect({
      lat,
      lng,
      address,
      city,
      state,
      pincode
    })
  }

  // Show manual input if no API key, load error, or user chose manual
  if (!apiKey || loadError || useManualInput) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Enter Location</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode * <span className="text-primary-600 text-xs">(Enter pincode to auto-detect location)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-lg py-3 px-3 focus:ring-2 focus:ring-primary-500 outline-none text-lg tracking-wider font-medium"
                />
                {fetchingPincode && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-600 animate-spin" />
                )}
              </div>
            </div>

            {city && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">{city}, {state}</p>
                    <p className="text-sm text-green-600">{address}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                placeholder="Street address, area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Select Location</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseManualInput(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Enter Manually
            </button>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Search
            </button>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loading}
              className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              title="Use current location"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={marker || { lat, lng }}
              zoom={12}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false
              }}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-gray-100">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        {/* Location Info */}
        {city && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-gray-800 font-medium">{city}</p>
                <p className="text-sm text-gray-600">{address}</p>
                {pincode && (
                  <p className="text-sm text-gray-500">Pincode: {pincode}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!city}
            className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationPicker
