import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Dashboard({ token, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editId, setEditId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(()=>{ fetchTasks() }, [])

  async function fetchTasks(){
    try {
      const res = await fetch('http://localhost:4000/api/v1/tasks', { headers: { Authorization: 'Bearer '+token } })
      const data = await res.json()
      setTasks(data || [])
      setMsg('')
    } catch (err) {
      setMsg('Error fetching tasks: ' + err.message)
    }
  }

  async function add(){
    if (!title.trim()) return setMsg('Title required')
    try {
      await fetch('http://localhost:4000/api/v1/tasks', { method: 'POST', headers: { Authorization: 'Bearer '+token, 'content-type': 'application/json' }, body: JSON.stringify({ title, description }) })
      setTitle('')
      setDescription('')
      setMsg('Task created!')
      fetchTasks()
    } catch(e){ 
      setMsg('Error: ' + e.message) 
    }
  }

  async function updateTask(){
    if (!editTitle.trim()) return setMsg('Title required')
    try {
      await fetch(`http://localhost:4000/api/v1/tasks/${editId}`, { method: 'PUT', headers: { Authorization: 'Bearer '+token, 'content-type': 'application/json' }, body: JSON.stringify({ title: editTitle, description: editDesc }) })
      setEditId(null)
      setMsg('Task updated!')
      fetchTasks()
    } catch(e){ 
      setMsg('Error: ' + e.message) 
    }
  }

  async function deleteTask(id){
    if (!confirm('Delete task?')) return
    try {
      await fetch(`http://localhost:4000/api/v1/tasks/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer '+token } })
      setMsg('Task deleted!')
      fetchTasks()
    } catch(e){ 
      setMsg('Error: ' + e.message) 
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={onLogout} style={{ float: 'right' }}>Logout</button>
      <h3>Tasks Dashboard</h3>
      {msg && <div style={{ padding: 10, margin: '10px 0', background: '#f0f0f0', borderLeft: '3px solid #666' }}>{msg}</div>}

      <div style={{ marginBottom: 20 }}>
        <h4>Create Task</h4>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="title" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="description (optional)" style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 60 }} />
        <button onClick={add}>Add Task</button>
      </div>

      <div>
        <h4>My Tasks ({tasks.length})</h4>
        {editId ? (
          <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <h4>Edit Task</h4>
            <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} placeholder="title" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} placeholder="description" style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 60 }} />
            <button onClick={updateTask} style={{ marginRight: 10 }}>Save</button>
            <button onClick={()=>setEditId(null)}>Cancel</button>
          </div>
        ) : null}
        {tasks.length === 0 ? <p>No tasks yet</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tasks.map(t => (
              <li key={t.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 10, borderRadius: 4 }}>
                <div><strong>{t.title}</strong> {t.completed ? '✓' : ''}</div>
                {t.description && <div style={{ color: '#666', fontSize: '0.9em' }}>{t.description}</div>}
                <div style={{ marginTop: 8 }}>
                  <button onClick={()=>{ setEditId(t.id); setEditTitle(t.title); setEditDesc(t.description || '') }} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={()=>deleteTask(t.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
