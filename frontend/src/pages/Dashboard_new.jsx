import { useState, useEffect } from 'react'
import axios from 'axios'

function CreateForm({ onCreated }) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const api = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const token = localStorage.getItem('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!originalUrl.trim()) return

    setIsLoading(true)
    setMsg('')

    try {
      const data = { originalUrl: originalUrl.trim() }
      if (customCode.trim()) {
        data.customCode = customCode.trim()
      }

      const res = await axios.post(
        api + '/api/urls',
        data,
        { headers: { Authorization: 'Bearer ' + token } }
      )

      setMsg(`✅ Short URL created: ${res.data.shortUrl}`)
      setOriginalUrl('')
      setCustomCode('')
      onCreated()
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Something went wrong'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          <span className="text-orange-500">🚀</span> Shorten URLs with Lightning Speed
        </h1>
        <p className="text-gray-600 text-lg">Transform long URLs into short, shareable links in seconds</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-orange-400 transition-colors duration-200"
              required
            />
          </div>

          {/* Custom Code Input */}
          <div>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Custom short code (optional)"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-orange-400 transition-colors duration-200"
            />
            <p className="text-sm text-gray-500 mt-2">Leave empty for auto-generated code</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !originalUrl.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>🔗</span>
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {/* Success/Error Message */}
        {msg && (
          <div className={`mt-6 p-4 rounded-lg text-center ${msg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [urls, setUrls] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const api = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const token = localStorage.getItem('token')

  const copyToClipboard = async (shortUrl, id) => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const load = async () => {
    try {
      const res = await axios.get(api + '/api/urls', { headers: { Authorization: 'Bearer ' + token } })
      setUrls(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Shortener Section */}
        <CreateForm onCreated={load} />
        
        {/* Your Links Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>📊</span> Your Shortened Links
          </h2>
          
          {urls.length > 0 ? (
            <div className="space-y-4">
              {urls.map((url) => (
                <div key={url._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-orange-500 font-mono font-semibold">
                          {url.shortUrl}
                        </span>
                        <button
                          onClick={() => copyToClipboard(url.shortUrl, url._id)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors duration-200"
                        >
                          {copiedId === url._id ? '✅ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm truncate" title={url.originalUrl}>
                        {url.originalUrl}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>👆 {url.clicks || 0} clicks</span>
                        <span>📅 {new Date(url.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/analytics/${url.shortCode}`}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                      >
                        📈 Analytics
                      </a>
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-medium"
                      >
                        🔗 Visit
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">🔗</div>
              <p className="text-lg">No shortened links yet. Create your first one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
