import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-primary-400">LocalServices</h3>
            <p className="mt-4 text-gray-400 leading-relaxed">
              Find trusted local service providers near you. From electricians to tutors,
              we connect you with verified professionals for all your needs.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 group"
              >
                <Facebook className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 group"
              >
                <Twitter className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 group"
              >
                <Instagram className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 group"
              >
                <Linkedin className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white relative inline-block">
              Quick Links
              <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-primary-500 rounded-full" />
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-primary-500 transition-colors" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-primary-500 transition-colors" />
                  Find Services
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-primary-500 transition-colors" />
                  Register as Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white relative inline-block">
              Support
              <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-primary-500 rounded-full" />
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-primary-500 transition-colors" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-primary-500 transition-colors" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-primary-500 transition-colors" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white relative inline-block">
              Contact Us
              <span className="absolute -bottom-1.5 left-0 w-8 h-0.5 bg-primary-500 rounded-full" />
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 group">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-gray-700 transition-colors">
                  <MapPin className="w-4 h-4 text-primary-400" />
                </div>
                <span className="pt-1.5">Mumbai, India</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400 group">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-gray-700 transition-colors">
                  <Phone className="w-4 h-4 text-primary-400" />
                </div>
                <span className="pt-1.5">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400 group">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-gray-700 transition-colors">
                  <Mail className="w-4 h-4 text-primary-400" />
                </div>
                <span className="pt-1.5">info@localservices.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="mt-12 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>&copy; {currentYear} Smart Local Services Finder. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> in India
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
