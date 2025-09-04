import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3,
  Search,
  Filter,
  Calendar,
  Globe,
  TrendingUp,
  Users,
  MousePointer,
  QrCode
} from 'lucide-react'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Fetch user's URLs
  const { data: urlsData, isLoading, error } = useQuery(
    ['urls', { search: searchTerm, sortBy, sortOrder, page: currentPage }],
    async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: '10'
      })
      const response = await axios.get(`/urls?${params}`)
      return response.data.data
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  // Delete URL mutation
  const deleteMutation = useMutation(
    async (urlId) => {
      await axios.delete(`/urls/${urlId}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('urls')
        refreshUser()
        toast.success('URL deleted successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete URL')
      }
    }
  )

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleDelete = async (url) => {
    if (window.confirm(`Are you sure you want to delete "${url.title}"?`)) {
      deleteMutation.mutate(url._id)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              {error.response?.data?.message || 'Something went wrong'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const urls = urlsData?.urls || []
  const pagination = urlsData?.pagination || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Welcome back, {user?.name}! Manage your shortened URLs.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Short URL
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LinkIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total URLs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user?.urlsCount || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MousePointer className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Clicks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user?.totalClicks || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg. Clicks/URL
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user?.urlsCount > 0 
                        ? Math.round((user?.totalClicks || 0) / user.urlsCount)
                        : 0
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Member Since
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {user?.createdAt 
                        ? format(new Date(user.createdAt), 'MMM yyyy')
                        : 'N/A'
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search URLs, titles, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-auto"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="clicks">Clicks</option>
                  <option value="title">Title</option>
                  <option value="lastClickedAt">Last Clicked</option>
                </select>
                
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="input w-auto"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                
                <button type="submit" className="btn btn-outline">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* URLs List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your URLs</h2>
          </div>
          
          {urls.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No URLs found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'No URLs match your search criteria.'
                  : 'Get started by creating your first short URL.'
                }
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First URL
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {urls.map((url) => (
                  <div key={url._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {url.title}
                          </h3>
                          {!url.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Short URL:</span>
                            <span className="text-sm font-mono text-primary-600">
                              {url.shortUrl}
                            </span>
                            <button
                              onClick={() => copyToClipboard(url.shortUrl)}
                              className="btn btn-ghost p-1"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <a
                              href={url.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost p-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Original:</span>
                            <span className="text-sm text-gray-700 truncate max-w-md">
                              {url.originalUrl}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MousePointer className="h-4 w-4 mr-1" />
                            {url.clicks} clicks
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(url.createdAt), 'MMM d, yyyy')}
                          </span>
                          {url.lastClickedAt && (
                            <span>
                              Last clicked: {format(new Date(url.lastClickedAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/analytics/${url._id}`}
                          className="btn btn-outline btn-sm"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(url)}
                          className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 hover:border-red-300"
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                      {pagination.totalItems} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create URL Modal - Simple implementation */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create Short URL
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Go to the home page to create a new short URL with full options.
            </p>
            <div className="flex space-x-3">
              <Link
                to="/"
                className="btn btn-primary flex-1"
                onClick={() => setShowCreateForm(false)}
              >
                Go to Home
              </Link>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
