import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Trash2, User } from 'lucide-react'

export default function Users() {
  const [list, setList] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = () => {
    setLoading(true)
    api.users.list().then(setList).catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Xato')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" ni o'chirmoqchimisiz?`)) return
    try {
      await api.users.delete(id)
      load()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Xato')
    }
  }

  if (loading) return <div className="text-slate-400">Yuklanmoqda...</div>
  if (err) return <div className="text-red-400">Xato: {err}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Foydalanuvchilar</h1>
        <p className="mt-1 text-sm text-slate-400">Ro&apos;yxatdan o&apos;tgan barcha foydalanuvchilar</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-900/50 shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-400 font-medium">ID</th>
              <th className="text-left p-4 text-slate-400 font-medium">Ism</th>
              <th className="text-left p-4 text-slate-400 font-medium">Username</th>
              <th className="text-left p-4 text-slate-400 font-medium">Telegram ID</th>
              <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
              <th className="text-left p-4 text-slate-400 font-medium">Ro&apos;yxatdan o&apos;tgan</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={String(u.id)} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="p-4">{String(u.id)}</td>
                <td className="p-4 flex items-center gap-2">
                  {u.photo_url ? (
                    <img src={String(u.photo_url)} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="p-4 text-slate-300">@{String(u.username || '—')}</td>
                <td className="p-4 text-slate-400 font-mono text-sm">{String(u.telegram_id)}</td>
                <td className="p-4">
                  <span className={u.subscription_plan === 'pro' ? 'px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-sm' : 'text-slate-500 text-sm'}>
                    {String(u.subscription_plan || 'free')}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-sm">{u.created_at ? new Date(String(u.created_at)).toLocaleDateString('uz') : '—'}</td>
                <td className="p-4">
                  <button onClick={() => onDelete(Number(u.id), String(u.first_name || u.username || 'User'))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="O'chirish">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-slate-500 text-sm">Jami: {list.length} ta foydalanuvchi</p>
    </div>
  )
}
