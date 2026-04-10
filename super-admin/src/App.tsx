import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Subscriptions from './pages/Subscriptions'
import AiRequests from './pages/AiRequests'
import Styles from './pages/Styles'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null)
  const token = localStorage.getItem('admin_token')
  useEffect(() => {
    if (!token) {
      setOk(false)
      return
    }
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok)
      .then(setOk)
      .catch(() => setOk(false))
  }, [token])
  if (ok === null) return <div className="flex items-center justify-center min-h-screen text-slate-400">Yuklanmoqda...</div>
  if (!ok) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="ai-requests" element={<AiRequests />} />
        <Route path="styles" element={<Styles />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
