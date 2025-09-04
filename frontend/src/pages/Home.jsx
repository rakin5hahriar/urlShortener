import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  Link as LinkIcon, 
  BarChart3, 
  Shield, 
  Zap, 
  Copy, 
  ExternalLink,
  QrCode,
  Sparkles
} from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const [shortenedUrl, setShortenedUrl] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('/urls', {
        originalUrl: url.trim(),
        customAlias: customAlias.trim() || undefined
      })

      if (response.data.success) {
        setShortenedUrl(response.data.data.url)
        setUrl('')
        setCustomAlias('')
        toast.success('URL shortened successfully!')
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to shorten URL'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Shorten URLs with
              <span className="gradient-text block mt-2">
                Style & Analytics
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform long, ugly URLs into short, memorable links. Track clicks, 
              analyze traffic, and manage your links with powerful analytics.
            </p>

            {/* URL Shortener Form */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter your long URL here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg px-8 whitespace-nowrap"
                  >
                    {loading ? (
                      <div className="loading-spinner h-5 w-5 mr-2" />
                    ) : (
                      <Sparkles className="h-5 w-5 mr-2" />
                    )}
                    Shorten
                  </button>
                </div>
                
                {/* Custom Alias Input */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">urlshort.com/</span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="custom-alias (optional)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    pattern="[a-zA-Z0-9_-]+"
                    title="Only letters, numbers, hyphens, and underscores allowed"
                  />
                </div>
              </form>

              {/* Result */}
              {shortenedUrl && (
                <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm animate-slide-up">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your shortened URL:</h3>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <span className="flex-1 text-primary-600 font-medium">
                      {shortenedUrl.shortUrl}
                    </span>
                    <button
                      onClick={() => copyToClipboard(shortenedUrl.shortUrl)}
                      className="btn btn-outline btn-sm"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={shortenedUrl.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Original: {shortenedUrl.originalUrl}
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            {!isAuthenticated && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Want analytics and link management?
                </p>
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg"
                >
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose URLShort?
            </h2>
            <p className="text-xl text-gray-600">
              More than just URL shortening - get insights and control
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                <BarChart3 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-600">
                Track clicks, locations, devices, and more with detailed analytics dashboard
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Reliable
              </h3>
              <p className="text-gray-600">
                Enterprise-grade security with 99.9% uptime guarantee for your links
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Global CDN ensures your short links redirect instantly from anywhere
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">10M+</div>
              <div className="text-gray-600">Links Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who trust URLShort for their link management
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
            >
              Start Free Today
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
