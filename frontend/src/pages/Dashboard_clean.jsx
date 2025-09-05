import { useState } from 'react'

const CreateUrlForm = () => {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setMessage(null)

    // Simulate API call for demo
    setTimeout(() => {
      const shortCode = customCode || Math.random().toString(36).substring(2, 8)
      const shortUrl = `http://localhost:3000/${shortCode}`
      setMessage({ type: 'success', text: `URL shortened successfully! ${shortUrl}` })
      setUrl('')
      setCustomCode('')
      setLoading(false)
    }, 1000)
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

export default function Dashboard() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <CreateUrlForm />
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Demo Mode</h3>
          <p className="text-gray-600">This is a demo version. For full functionality, please login or register.</p>
        </div>
      </div>
    </div>
  )
}
