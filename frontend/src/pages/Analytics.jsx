import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import { 
  ArrowLeft, 
  MousePointer, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet,
  Calendar,
  TrendingUp,
  ExternalLink,
  Copy
} from 'lucide-react'
import { format } from 'date-fns'

const Analytics = () => {
  const { id } = useParams()

  // Fetch URL analytics
  const { data: analyticsData, isLoading, error } = useQuery(
    ['analytics', id],
    async () => {
      const response = await axios.get(`/urls/${id}/analytics`)
      return response.data.data.analytics
    },
    {
      refetchOnWindowFocus: false
    }
  )

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load analytics
            </h2>
            <p className="text-gray-600 mb-4">
              {error.response?.data?.message || 'Something went wrong'}
            </p>
            <Link to="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const analytics = analyticsData || {}
  const url = analytics.url || {}
  const summary = analytics.summary || {}
  const charts = analytics.charts || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/dashboard"
              className="btn btn-outline flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Analytics for "{url.title}"
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Short URL:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-primary-600">
                        {window.location.origin}/{url.shortCode}
                      </span>
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/${url.shortCode}`)}
                        className="btn btn-ghost p-1"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={`${window.location.origin}/${url.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost p-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Original URL:</span>
                    <p className="text-gray-700 break-all">{url.originalUrl}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Created:</span>
                    <p className="text-gray-700">
                      {url.createdAt ? format(new Date(url.createdAt), 'PPP') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {url.totalClicks || 0}
                </div>
                <div className="text-sm text-gray-500">Total Clicks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalClicks || 0}
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Unique Visitors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.uniqueVisitors || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Countries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.countries || 0}
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalClicks > 0 
                    ? `${Math.round((summary.uniqueVisitors / summary.totalClicks) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Countries */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Countries
            </h3>
            {charts.clicksByCountry && charts.clicksByCountry.length > 0 ? (
              <div className="space-y-3">
                {charts.clicksByCountry.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-primary-500 rounded-sm"></div>
                      <span className="text-sm text-gray-700">{item.country}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.clicks}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>

          {/* Top Browsers */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Browsers
            </h3>
            {charts.clicksByBrowser && charts.clicksByBrowser.length > 0 ? (
              <div className="space-y-3">
                {charts.clicksByBrowser.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                      <span className="text-sm text-gray-700">{item.browser}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.clicks}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>

          {/* Device Types */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Device Types
            </h3>
            {charts.clicksByDevice && charts.clicksByDevice.length > 0 ? (
              <div className="space-y-3">
                {charts.clicksByDevice.map((item, index) => {
                  const Icon = item.device === 'mobile' ? Smartphone : 
                              item.device === 'tablet' ? Tablet : Monitor
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 capitalize">
                          {item.device}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.clicks}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>

          {/* Operating Systems */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Operating Systems
            </h3>
            {charts.clicksByOS && charts.clicksByOS.length > 0 ? (
              <div className="space-y-3">
                {charts.clicksByOS.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                      <span className="text-sm text-gray-700">{item.os}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.clicks}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {analytics.recentClicks && analytics.recentClicks.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Browser
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.recentClicks.slice(0, 10).map((click, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(click.timestamp), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {click.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {click.browser}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="capitalize">{click.device}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
