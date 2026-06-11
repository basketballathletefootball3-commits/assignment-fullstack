import React, { useState } from 'react'
import { api } from '../api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!email || !password) return setMsg('Email and password required')
    setLoading(true)
    try {
      await api('/api/v1/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, name }) })
      setMsg('✓ Registered! Login to continue.')
      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      setMsg('✗ ' + (err?.error || 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ width: 300, border: '1px solid #ddd', padding: 15, borderRadius: 4 }}>
      <h3>Register</h3>
      <input placeholder="name (optional)" value={name} onChange={e=>setName(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
      <input placeholder="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
      <input placeholder="password (min 6)" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
      <button disabled={loading} style={{ width: '100%', padding: 10 }}>{loading ? 'Registering...' : 'Register'}</button>
      {msg && <div style={{ marginTop: 10, padding: 8, background: msg.includes('✓') ? '#e8f5e9' : '#ffebee', borderRadius: 4, fontSize: '0.9em' }}>{msg}</div>}
    </form>
  )
}
