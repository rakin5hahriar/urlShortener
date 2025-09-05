import React, { useState } from 'react'

function TestAuth() {
  const [result, setResult] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpass123')

  const testRegistration = async () => {
    try {
      console.log('Testing registration...')
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        setResult(`✅ Registration successful! Token: ${data.token.substring(0, 20)}...`)
        localStorage.setItem('token', data.token)
      } else {
        setResult(`❌ Registration failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Error:', error)
      setResult(`❌ Network error: ${error.message}`)
    }
  }

  const testLogin = async () => {
    try {
      console.log('Testing login...')
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        setResult(`✅ Login successful! Token: ${data.token.substring(0, 20)}...`)
        localStorage.setItem('token', data.token)
      } else {
        setResult(`❌ Login failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Error:', error)
      setResult(`❌ Network error: ${error.message}`)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={testRegistration}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Test Registration
        </button>
        <button 
          onClick={testLogin}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Test Login
        </button>
      </div>
      
      {result && (
        <div className="p-3 bg-gray-100 rounded">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}

export default TestAuth
