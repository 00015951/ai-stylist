import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Trash2, Edit2 } from 'lucide-react'

type SubRow = {
  id?: number
  user_id: number
  first_name?: string
  last_name?: string
  username?: string
  telegram_id?: number
  plan?: string | null
  expires_at?: string | null
  started_at?: string | null
}

export default function Subscriptions() {
  const [list, setList] = useState<SubRow[]>([])
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState({ userId: '', plan: 'pro' as string, expiresAt: '' })
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ plan: 'pro', expiresAt: '' })

  const load = () => {
    setLoading(true)
    Promise.all([api.subscriptions.list(), api.users.list()])
      .then(([subs, usr]) => {
        setList(subs as SubRow[])
        setUsers(usr as Record<string, unknown>[])
      })
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Xato'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => {
    setForm({ userId: '', plan: 'pro', expiresAt: '' })
    setModal('create')
  }
  const openEdit = (s: SubRow) => {
    if (s.id == null) return
    setEditId(Number(s.id))
    setEditForm({ plan: String(s.plan || 'pro'), expiresAt: s.expires_at ? String(s.expires_at).slice(0, 16) : '' })
    setModal('edit')
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.subscriptions.create({ userId: parseInt(form.userId, 10), plan: form.plan, expiresAt: form.expiresAt || undefined })
      setModal(null)
      load()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Xato')
    }
  }

  const update = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    try {
      await api.subscriptions.update(editId, { plan: editForm.plan, expiresAt: editForm.expiresAt || undefined })
      setModal(null)
      setEditId(null)
      load()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Xato')
    }
  }

  const remove = async (id: number) => {
    if (!confirm("O'chirmoqchimisiz?")) return
    try {
      await api.subscriptions.delete(id)
      load()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Xato')
    }
  }

  if (loading) return <div className="text-slate-400">Yuklanmoqda...</div>
  if (err) return <div className="text-red-400">Xato: {err}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pro obunalar</h1>
          <p className="mt-1 text-sm text-slate-400">Pro obuna qo&apos;shish va boshqarish</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-medium text-slate-900 transition-colors hover:bg-amber-600">
          <Plus className="w-4 h-4" />
          Qo&apos;shish
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-900/50 shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-400 font-medium">User ID</th>
              <th className="text-left p-4 text-slate-400 font-medium">Foydalanuvchi</th>
              <th className="text-left p-4 text-slate-400 font-medium">Telegram</th>
              <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
              <th className="text-left p-4 text-slate-400 font-medium">Tugash sanasi</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={String(s.user_id)} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="p-4 font-mono text-sm">{String(s.user_id)}</td>
                <td className="p-4">{[s.first_name, s.last_name].filter(Boolean).join(' ') || String(s.username || '—')}</td>
                <td className="p-4 text-slate-400 text-sm">@{String(s.username || '—')} / {String(s.telegram_id || '—')}</td>
                <td className="p-4">
                  <span className={s.plan === 'pro' ? 'px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-sm' : 'px-2 py-1 rounded bg-slate-700/50 text-slate-400 text-sm'}>
                    {String(s.plan || 'free')}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-sm">{s.expires_at ? new Date(String(s.expires_at)).toLocaleString('uz') : (s.plan === 'pro' ? 'Cheksiz' : '—')}</td>
                <td className="p-4 flex gap-2">
                  {s.id != null ? (
                    <>
                      <button onClick={() => openEdit(s)} className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg" title="Tahrirlash"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => remove(Number(s.id))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg" title="O'chirish"><Trash2 className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <button onClick={() => { setForm({ ...form, userId: String(s.user_id) }); setModal('create') }} className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-sm">Pro qo&apos;shish</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Pro obuna qo&apos;shish</h2>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Foydalanuvchi</label>
                <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" required>
                  <option value="">Tanlang...</option>
                  {users.filter((u) => (u.subscription_plan as string) !== 'pro').map((u) => (
                    <option key={String(u.id)} value={String(u.id)}>
                      {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || `User #${u.id}`} (@{u.username || '—'})
                    </option>
                  ))}
                  {users.filter((u) => (u.subscription_plan as string) !== 'pro').length === 0 && (
                    <option value="">Barchasi allaqachon Pro</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Plan</label>
                <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                  <option value="pro">Pro</option>
                  <option value="free">Free</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tugash sanasi (ixtiyoriy)</label>
                <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-900 font-medium rounded-lg">Saqlash</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-slate-600 rounded-lg">Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'edit' && editId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Obunani tahrirlash</h2>
            <form onSubmit={update} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Plan</label>
                <select value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                  <option value="pro">Pro</option>
                  <option value="free">Free</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tugash sanasi</label>
                <input type="datetime-local" value={editForm.expiresAt} onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-900 font-medium rounded-lg">Saqlash</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-slate-600 rounded-lg">Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
