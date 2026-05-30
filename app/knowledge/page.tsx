'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { BookOpen, Plus, Search, Trash2, Loader2, X } from 'lucide-react'
import clsx from 'clsx'
import type { Knowledge, KnowledgeCategory } from '@/lib/types'

const CATEGORIES: KnowledgeCategory[] = ['statute', 'case_law', 'definition', 'template', 'strategy', 'outcome']
const catColors: Record<string, string> = {
  statute:    'bg-blue-500/10 text-blue-400 border-blue-500/30',
  case_law:   'bg-purple-500/10 text-purple-400 border-purple-500/30',
  definition: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  template:   'bg-amber-500/10 text-amber-400 border-amber-500/30',
  strategy:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  outcome:    'bg-pink-500/10 text-pink-400 border-pink-500/30',
}

export default function KnowledgePage() {
  const [entries, setEntries] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [form, setForm] = useState({ title: '', content: '', category: 'statute' as KnowledgeCategory, source: '', tags: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ limit: '200' })
    if (filterCat) params.set('category', filterCat)
    if (search) params.set('q', search)
    const res = await fetch(`/api/knowledge?${params}`)
    const data = await res.json()
    setEntries(data.knowledge ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterCat, search])

  async function addEntry() {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      setForm({ title: '', content: '', category: 'statute', source: '', tags: '' })
      setShowAdd(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function deleteEntry(id: string) {
    setDeleting(id)
    try {
      await fetch('/api/knowledge', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setEntries(e => e.filter(x => x.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
              <p className="text-slate-400 text-sm mt-1">Statutes, case law, definitions, templates, and strategies used by the AI.</p>
            </div>
            <button onClick={() => setShowAdd(s => !s)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors">
              {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAdd ? 'Cancel' : 'Add Entry'}
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="bg-slate-900 rounded-xl border border-amber-500/30 p-6 space-y-4">
              <h2 className="text-white font-semibold">New Knowledge Entry</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. FDCPA Section 809 — Debt Validation"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as KnowledgeCategory }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Content *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Paste the full statute text, case summary, definition, or template..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 resize-y min-h-[120px] focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Source / Citation</label>
                  <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    placeholder="e.g. 15 U.S.C. § 1692g"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="fdcpa, debt, validation"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <button onClick={addEntry} disabled={saving || !form.title || !form.content}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-sm transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save Entry
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilterCat('')}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  !filterCat ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white')}>
                All
              </button>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilterCat(filterCat === c ? '' : c)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border capitalize',
                    filterCat === c ? `${catColors[c]}` : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white')}>
                  {c.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-10 text-center">
              <BookOpen className="w-9 h-9 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No entries yet</p>
              <p className="text-slate-500 text-sm mt-1">Add statutes, definitions, templates, and case law to train the AI.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => (
                <div key={entry.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border capitalize', catColors[entry.category])}>
                          {entry.category.replace('_', ' ')}
                        </span>
                        {entry.source && (
                          <span className="text-xs text-slate-500">{entry.source}</span>
                        )}
                      </div>
                      <p className="text-white font-medium">{entry.title}</p>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{entry.content}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map(t => (
                            <span key={t} className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteEntry(entry.id)} disabled={deleting === entry.id}
                      className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 flex-shrink-0">
                      {deleting === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
