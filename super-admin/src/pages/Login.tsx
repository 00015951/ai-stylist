import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, User, Lock } from 'lucide-react'
import { api } from '@/lib/api'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Token bor va valid bo'lsa, / ga redirect
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok && navigate('/', { replace: true }))
      .catch(() => {})
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await api.login(login.trim(), password)
      navigate('/', { replace: true })
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Xato')
      localStorage.removeItem('admin_token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md p-8 bg-slate-900/80 border border-slate-700/50 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Sparkles className="w-12 h-12 text-amber-500" />
          <h1 className="text-2xl font-bold">Super Admin</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Login</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Parol</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                required
              />
            </div>
          </div>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Tekshirilmoqda...' : 'Kirish'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500 text-center">
          Login: admin, Parol: admin111
        </p>
      </div>
    </div>
  )
}
