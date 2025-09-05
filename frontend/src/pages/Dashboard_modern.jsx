import { useState, useEffect } from 'react'
import axios from 'axios'

const CreateUrlForm = ({ onUrlCreated }) => {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const token = localStorage.getItem('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const payload = { originalUrl: url.trim() }
      if (customCode.trim()) payload.customCode = customCode.trim()

      const response = await axios.post(`${API_BASE}/api/urls`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage({ type: 'success', text: `URL shortened successfully! ${response.data.shortUrl}` })
      setUrl('')
      setCustomCode('')
      onUrlCreated()
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to shorten URL' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          URL Shortener
        </h1>
        <p className="text-gray-600 text-lg">
          Transform long URLs into short, shareable links
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Enter URL to shorten
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-2">
            Custom short code (optional)
          </label>
          <input
            id="customCode"
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="my-custom-code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-sm text-gray-500 mt-1">Leave empty for auto-generated code</p>
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Shortening...</span>
            </>
          ) : (
            <span>Shorten URL</span>
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-6 p-4 rounded-lg max-w-2xl mx-auto ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}

const UrlList = ({ urls, onCopy }) => {
  if (urls.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No shortened URLs yet</h3>
        <p className="text-gray-600">Create your first shortened URL above to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Shortened URLs</h2>
      <div className="space-y-4">
        {urls.map((urlItem) => (
          <UrlCard key={urlItem._id} url={urlItem} onCopy={onCopy} />
        ))}
      </div>
    </div>
  )
}

const UrlCard = ({ url, onCopy }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl)
      setCopied(true)
      onCopy?.(url.shortUrl)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <code className="text-blue-600 font-mono font-semibold bg-blue-50 px-2 py-1 rounded">
              {url.shortUrl}
            </code>
            <button
              onClick={handleCopy}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-gray-600 text-sm truncate" title={url.originalUrl}>
            {url.originalUrl}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{url.clicks || 0} clicks</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
              </svg>
              <span>{new Date(url.createdAt).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <a
            href={`/analytics/${url.shortCode}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </a>
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const token = localStorage.getItem('token')

  const fetchUrls = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/urls`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUrls(response.data)
    } catch (error) {
      console.error('Failed to fetch URLs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUrls()
  }, [])

  const handleUrlCreated = () => {
    fetchUrls()
  }

  const handleCopy = (url) => {
    // Optional: Add analytics or notifications for copy events
    console.log('URL copied:', url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <CreateUrlForm onUrlCreated={handleUrlCreated} />
        <UrlList urls={urls} onCopy={handleCopy} />
      </div>
    </div>
  )
}
