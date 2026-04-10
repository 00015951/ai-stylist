import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Trash2 } from 'lucide-react'

export default function AiRequests() {
  const [list, setList] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = () => {
    setLoading(true)
    api.aiRequests.list().then(setList).catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Xato')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id: number) => {
    if (!confirm("O'chirmoqchimisiz?")) return
    try {
      await api.aiRequests.delete(id)
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
        <h1 className="text-2xl font-bold text-white">AI so&apos;rovlar</h1>
        <p className="mt-1 text-sm text-slate-400">Foydalanuvchilar AI orqali kiyim tavsiyalari so&apos;ragan har bir marta yoziladi.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-900/50 shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-400 font-medium">ID</th>
              <th className="text-left p-4 text-slate-400 font-medium">Foydalanuvchi</th>
              <th className="text-left p-4 text-slate-400 font-medium">Occasion</th>
              <th className="text-left p-4 text-slate-400 font-medium">Preview</th>
              <th className="text-left p-4 text-slate-400 font-medium">Sana</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={String(r.id)} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="p-4">{String(r.id)}</td>
                <td className="p-4">{[r.first_name, r.last_name].filter(Boolean).join(' ') || String(r.username || `#${r.user_id}` || '—')}</td>
                <td className="p-4 text-slate-300 max-w-[200px] truncate">{String(r.occasion || '—')}</td>
                <td className="p-4 text-slate-400 text-sm max-w-[300px] truncate">{String(r.response_preview || '—')}</td>
                <td className="p-4 text-slate-500 text-sm">{r.created_at ? new Date(String(r.created_at)).toLocaleString('uz') : '—'}</td>
                <td className="p-4">
                  <button onClick={() => onDelete(Number(r.id))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-slate-500 text-sm">Jami: {list.length} ta so&apos;rov (oxirgi 500)</p>
    </div>
  )
}
