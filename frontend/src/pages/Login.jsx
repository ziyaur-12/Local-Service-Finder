import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, Shield, Star, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await login(formData.email, formData.password)
      toast.success('Login successful!')

      if (response.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (response.user.role === 'provider') {
        navigate('/provider/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary-400/20 rounded-full blur-lg" />

        <div className="relative z-10 flex flex-col justify-center items-start px-16 text-white">
          <div className="animate-fadeInUp">
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Welcome to<br />
              <span className="text-primary-200">LocalServices</span>
            </h1>
            <p className="text-lg text-primary-100 mb-12 max-w-md leading-relaxed">
              Your trusted platform to discover and connect with verified local service
              professionals. Sign in to manage bookings, reviews, and more.
            </p>
          </div>

          <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-200" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Verified Providers</h4>
                <p className="text-sm text-primary-200">All professionals are background-checked</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Star className="w-6 h-6 text-primary-200" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Trusted Reviews</h4>
                <p className="text-sm text-primary-200">Real ratings from real customers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-200" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Growing Community</h4>
                <p className="text-sm text-primary-200">Thousands of happy users across India</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-8">
        <div className="max-w-md w-full">
          <div className="lg:hidden text-center mb-6 animate-fadeInUp">
            <h2 className="text-2xl font-bold text-primary-600">LocalServices</h2>
          </div>

          <div className="animate-fadeInUp">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your account to continue</p>
            </div>
          </div>

          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-gray-200/60 dark:shadow-slate-900/60 p-8 border border-gray-100 dark:border-slate-700 animate-fadeInUp"
            style={{ animationDelay: '0.1s' }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-primary-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-primary-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-shine w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-semibold text-base shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-800 text-gray-400">or</span>
                </div>
              </div>

              <p className="text-center text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
