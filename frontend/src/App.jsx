import React, { useState } from 'react'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  return (
    <div style={{ padding: 20 }}>
      <h2>Assignment Demo</h2>
      {!token ? (
        <div style={{ display: 'flex', gap: 20 }}>
          <Register />
          <Login onLogin={(t) => { setToken(t); localStorage.setItem('token', t) }} />
        </div>
      ) : (
        <Dashboard token={token} onLogout={() => { setToken(null); localStorage.removeItem('token') }} />
      )}
    </div>
  )
}
