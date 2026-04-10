import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  Users,
  Crown,
  Shirt,
  MessageSquare,
  TrendingUp,
  Zap,
  RefreshCw,
  BarChart3,
} from 'lucide-react'
import { api } from '@/lib/api'

const statCards = [
  { key: 'totalUsers', label: "Jami ro'yxatdan o'tganlar", icon: Users, bg: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400' },
  { key: 'totalPro', label: 'Pro obuna', icon: Crown, bg: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400' },
  { key: 'totalOutfits', label: 'Saqlangan kiyimlar', icon: Shirt, bg: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  { key: 'totalAiRequests', label: "AI so'rovlar", icon: MessageSquare, bg: 'from-violet-500/10 to-violet-600/5', border: 'border-violet-500/30', text: 'text-violet-400' },
  { key: 'usersLast7Days', label: 'Yangi foydalanuvchilar (7 kun)', icon: TrendingUp, bg: 'from-cyan-500/10 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  { key: 'aiRequestsLast7Days', label: "AI so'rovlar (7 kun)", icon: Zap, bg: 'from-rose-500/10 to-rose-600/5', border: 'border-rose-500/30', text: 'text-rose-400' },
]

function formatDate(d: string) {
  const parts = d.split('-')
  if (parts.length >= 2) return `${parts[2]}.${parts[1]}`
  return d
}

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [daily, setDaily] = useState<{
    labels: string[]
    users: { date: string; users: number }[]
    aiRequests: { date: string; aiRequests: number }[]
    outfits: { date: string; outfits: number }[]
  } | null>(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const [s, d] = await Promise.all([api.stats(), api.statsDaily()])
      setStats(s)
      setDaily(d)
      setErr('')
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Xato')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    load()
  }

  if (err && !stats) return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
      Xato: {err}
      <button onClick={load} className="ml-4 rounded-lg bg-red-500/20 px-3 py-1 text-sm hover:bg-red-500/30">
        Qayta urinish
      </button>
    </div>
  )

  if (loading && !stats) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <RefreshCw className="h-8 w-8 animate-spin text-slate-500" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Virtual AI Stylist — barcha statistikalar</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon, bg, border, text }) => (
          <div
            key={key}
            className={`rounded-2xl border bg-gradient-to-br ${bg} ${border} p-5 transition-shadow hover:shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats?.[key] ?? 0}</p>
              </div>
              <div className={`rounded-xl bg-slate-800/50 p-3 ${text}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Statistika (oxirgi 7 kun) — Line chart</h2>
        </div>
        <div className="h-[300px]">
          {daily?.labels?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={daily.labels.map((date) => {
                  const u = daily.users?.find((x) => x.date === date)
                  const a = daily.aiRequests?.find((x) => x.date === date)
                  const o = daily.outfits?.find((x) => x.date === date)
                  return {
                    date,
                    Foydalanuvchilar: u?.users ?? 0,
                    "AI so'rovlar": a?.aiRequests ?? 0,
                    'Saqlangan kiyimlar': o?.outfits ?? 0,
                  }
                })}
                margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelFormatter={(v) => formatDate(v)}
                />
                <Legend />
                <Line type="monotone" dataKey="Foydalanuvchilar" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="AI so'rovlar" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Saqlangan kiyimlar" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">Ma&apos;lumot yo&apos;q</div>
          )}
        </div>
      </div>
    </div>
  )
}
