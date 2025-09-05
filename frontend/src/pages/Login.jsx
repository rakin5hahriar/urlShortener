import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const api = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await axios.post(api + '/api/auth/login', { email, password })
      login(res.data.token)
      navigate('/')
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={submit} className="space-y-6">
            {err && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {err}
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <input 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="Enter your email" 
                type="email"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="Enter your password" 
                type="password" 
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-medium transition-colors"
            >
              Sign In
            </button>
          </form>
          
          <p className="mt-6 text-center text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
