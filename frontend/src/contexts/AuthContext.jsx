import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
          // Verify token with server
          const response = await axios.get('/auth/verify-token')
          if (response.data.success) {
            setUser(JSON.parse(storedUser))
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await axios.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data
        
        // Store in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Update state
        setUser(userData)
        
        toast.success('Login successful!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      setLoading(true)
      const response = await axios.post('/auth/register', { name, email, password })
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data
        
        // Store in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Update state
        setUser(userData)
        
        toast.success('Registration successful!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateProfile = async (data) => {
    try {
      setLoading(true)
      const response = await axios.put('/auth/profile', data)
      
      if (response.data.success) {
        const updatedUser = response.data.data.user
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Update state
        setUser(updatedUser)
        
        toast.success('Profile updated successfully!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true)
      const response = await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
      
      if (response.data.success) {
        toast.success('Password changed successfully!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await axios.get('/auth/profile')
      if (response.data.success) {
        const userData = response.data.data.user
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
