const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function api(path, opts = {}) {
  const res = await fetch(BASE + path, opts)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw json
  return json
}
