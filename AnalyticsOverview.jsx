import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  )
}

function TopUrlsCard({ urls }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-6">Top Performing URLs</h3>
      <div className="space-y-4">
        {urls.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No URLs created yet</div>
        ) : (
          urls.slice(0, 5).map((url, index) => (
            <div key={url._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {window.location.origin}/{url.shortCode}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {url.originalUrl}
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{url.clickCount || 0}</div>
                  <div className="text-xs text-gray-500">clicks</div>
                </div>
                <Link 
                  to={`/analytics/${url._id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RecentActivityCard({ recentClicks }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-6">Recent Activity</h3>
      <div className="space-y-3">
        {recentClicks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No recent activity</div>
        ) : (
          recentClicks.slice(0, 10).map((click, index) => (
            <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  /{click.shortCode}
                </div>
                <div className="text-xs text-gray-500">
                  {click.country || 'Unknown'} • {click.browser || 'Unknown Browser'}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(click.createdAt || click.at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function AnalyticsOverview() {
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    topUrls: [],
    recentClicks: []
  })
  const [loading, setLoading] = useState(true)
  const api = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        
        // Fetch all URLs for the user
        const urlsResponse = await axios.get(api + '/api/urls', {
          headers: { Authorization: 'Bearer ' + token }
        })
        
        const urls = urlsResponse.data
        let totalClicks = 0
        let allClicks = []
        
        // Calculate total clicks and gather all click data
        for (const url of urls) {
          try {
            const analyticsResponse = await axios.get(api + `/api/urls/${url._id}/analytics`, {
              headers: { Authorization: 'Bearer ' + token }
            })
            const analytics = analyticsResponse.data
            url.clickCount = analytics.total
            totalClicks += analytics.total
            
            // Add shortCode to each click for display
            const clicksWithShortCode = analytics.recentClicks.map(click => ({
              ...click,
              shortCode: url.shortCode,
              createdAt: click.at // Map 'at' field to 'createdAt' for consistency
            }))
            allClicks = [...allClicks, ...clicksWithShortCode]
          } catch (error) {
            console.error(`Error fetching analytics for URL ${url._id}:`, error)
            url.clickCount = 0
          }
        }
        
        // Sort URLs by click count
        const sortedUrls = urls.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
        
        // Sort recent clicks by date
        const sortedClicks = allClicks.sort((a, b) => new Date(b.createdAt || b.at) - new Date(a.createdAt || a.at))
        
        setStats({
          totalUrls: urls.length,
          totalClicks,
          topUrls: sortedUrls,
          recentClicks: sortedClicks
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [api, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
              <p className="text-gray-600 mt-2">Track your URL performance and user engagement</p>
            </div>
            <Link 
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total URLs"
            value={stats.totalUrls}
            subtitle="Links created"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          />
          
          <StatCard
            title="Total Clicks"
            value={stats.totalClicks}
            subtitle="All time clicks"
            icon={
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            }
          />
          
          <StatCard
            title="Avg. Clicks per URL"
            value={stats.totalUrls > 0 ? Math.round(stats.totalClicks / stats.totalUrls) : 0}
            subtitle="Performance metric"
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          
          <StatCard
            title="Active URLs"
            value={stats.topUrls.filter(url => (url.clickCount || 0) > 0).length}
            subtitle="URLs with clicks"
            icon={
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopUrlsCard urls={stats.topUrls} />
          <RecentActivityCard recentClicks={stats.recentClicks} />
        </div>
      </div>
    </div>
  )
}
