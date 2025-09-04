import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, AlertCircle, Clock, Link as LinkIcon } from 'lucide-react'

const Redirect = () => {
  const { shortCode } = useParams()
  const [status, setStatus] = useState('loading') // loading, redirecting, error, expired
  const [error, setError] = useState('')
  const [originalUrl, setOriginalUrl] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const redirectToUrl = async () => {
      try {
        // Make a request to get the URL details without triggering redirect
        const response = await fetch(`${window.location.origin}/${shortCode}`, {
          method: 'HEAD' // Use HEAD to avoid redirect
        })

        if (response.ok) {
          // If successful, redirect immediately
          window.location.href = `${window.location.origin}/${shortCode}`
        } else if (response.status === 404) {
          setError('Short URL not found')
          setStatus('error')
        } else if (response.status === 410) {
          setError('Short URL has expired')
          setStatus('expired')
        } else {
          setError('Failed to redirect')
          setStatus('error')
        }
      } catch (error) {
        console.error('Redirect error:', error)
        setError('Network error occurred')
        setStatus('error')
      }
    }

    if (shortCode) {
      redirectToUrl()
    }
  }, [shortCode])

  useEffect(() => {
    if (status === 'redirecting' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (status === 'redirecting' && countdown === 0) {
      window.location.href = originalUrl
    }
  }, [status, countdown, originalUrl])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-600">
            Please wait while we redirect you to your destination
          </p>
        </div>
      </div>
    )
  }

  if (status === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8">
          <div className="mb-6">
            <Clock className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Redirecting in {countdown}...
            </h2>
            <p className="text-gray-600 mb-4">
              You will be automatically redirected to:
            </p>
            <div className="p-3 bg-gray-100 rounded-md break-all text-sm text-gray-700">
              {originalUrl}
            </div>
          </div>
          
          <div className="space-y-3">
            <a
              href={originalUrl}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Go Now
            </a>
            <Link
              to="/"
              className="btn btn-outline w-full"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error' || status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'expired' ? 'Link Expired' : 'Link Not Found'}
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <div className="p-3 bg-gray-100 rounded-md text-sm text-gray-700">
              {window.location.origin}/{shortCode}
            </div>
          </div>

          <div className="space-y-4">
            {status === 'expired' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">
                  What happened?
                </h3>
                <p className="text-sm text-yellow-700">
                  This short link has expired and is no longer valid. The link owner may have set an expiration date or deactivated it.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-left">
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Possible reasons:
                </h3>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>The short code doesn't exist</li>
                  <li>The link has been deleted</li>
                  <li>There was a typo in the URL</li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/"
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Create Your Own Short Link
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="btn btn-outline w-full"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Need help?
            </h3>
            <p className="text-sm text-blue-700">
              If you believe this link should work, please contact the person who shared it with you or{' '}
              <a href="#" className="font-medium underline">
                report this issue
              </a>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Redirect
