import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function Styles() {
  const [list, setList] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState({ key: '', name_en: '', name_ru: '', name_uz: '', image_url: '', description: '' })
  const [editId, setEditId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    api.styles.list().then(setList).catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Xato')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => {
    setForm({ key: '', name_en: '', name_ru: '', name_uz: '', image_url: '', description: '' })
    setModal('create')
  }
  const openEdit = (s: Record<string, unknown>) => {
    setEditId(Number(s.id))
    const name = (s.name as Record<string, string>) || {}
    setForm({
      key: String(s.key),
      name_en: String(name.en ?? s.name_en ?? ''),
      name_ru: String(name.ru ?? s.name_ru ?? ''),
      name_uz: String(name.uz ?? s.name_uz ?? ''),
      image_url: String(s.imageUrl ?? s.image_url ?? ''),
      description: String(s.description ?? ''),
    })
    setModal('edit')
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.styles.create(form)
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
      await api.styles.update(editId, form)
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
      await api.styles.delete(id)
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
          <h1 className="text-2xl font-bold text-white">Uslublar</h1>
          <p className="mt-1 text-sm text-slate-400">Kiyim uslublari (casual, business, ...)</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-medium text-slate-900 transition-colors hover:bg-amber-600">
          <Plus className="w-4 h-4" />
          Qo&apos;shish
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const name = (s.name as Record<string, string>) || {}
          const img = s.imageUrl ?? s.image_url
          return (
          <div key={String(s.id)} className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
            {img && <img src={String(img)} alt="" className="w-full h-40 object-cover" />}
            <div className="p-4">
              <div className="font-mono text-amber-400 mb-1">{String(s.key)}</div>
              <div className="text-sm text-slate-300 space-y-0.5">
                <div>EN: {String(name.en ?? s.name_en ?? '—')}</div>
                <div>RU: {String(name.ru ?? s.name_ru ?? '—')}</div>
                <div>UZ: {String(name.uz ?? s.name_uz ?? '—')}</div>
              </div>
              {s.description && <p className="mt-2 text-slate-500 text-xs line-clamp-2">{String(s.description)}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(s)} className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => remove(Number(s.id))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Uslub qo&apos;shish</h2>
            <form onSubmit={create} className="space-y-4">
              <div><label className="block text-sm text-slate-400 mb-1">Key</label><input type="text" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" required /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Name EN</label><input type="text" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Name RU</label><input type="text" value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Name UZ</label><input type="text" value={form.name_uz} onChange={(e) => setForm({ ...form, name_uz: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Image URL</label><input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-900 font-medium rounded-lg">Saqlash</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-slate-600 rounded-lg">Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'edit' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Uslubni tahrirlash</h2>
            <form onSubmit={update} className="space-y-4">
              <div><label className="block text-sm text-slate-400 mb-1">Key</label><input type="text" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" required /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Name EN</label><input type="text" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Name RU</label><input type="text" value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Name UZ</label><input type="text" value={form.name_uz} onChange={(e) => setForm({ ...form, name_uz: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Image URL</label><input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div><label className="block text-sm text-slate-400 mb-1">Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg" /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-900 font-medium rounded-lg">Saqlash</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-slate-600 rounded-lg">Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
