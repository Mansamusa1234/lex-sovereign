'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { FileText, Upload, Loader2, File, Eye, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import type { Document } from '@/lib/types'
import { supabaseClient as supabase } from '@/lib/supabase-client'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [viewing, setViewing] = useState<Document | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await supabase.from('documents').select('*').order('uploaded_at', { ascending: false }).limit(100)
    setDocs((data as Document[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function upload(file: File) {
    setUploadError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/documents/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await load()
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Documents</h1>
            <p className="text-slate-400 text-sm mt-1">Upload PDFs and DOCX files for the AI to search and reference.</p>
          </div>

          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={clsx(
              'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
              dragging
                ? 'border-amber-500/60 bg-amber-500/5'
                : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
            )}
          >
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
              onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <p className="text-slate-300 text-sm font-medium">Processing document…</p>
                <p className="text-slate-500 text-xs">Extracting text and generating embeddings</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-slate-300 font-medium">Drop a file here or click to browse</p>
                <p className="text-slate-500 text-sm">PDF, DOCX, or TXT — max ~10 MB recommended</p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" />
              {uploadError}
            </div>
          )}

          {/* Document list */}
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : docs.length === 0 ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-10 text-center">
              <FileText className="w-9 h-9 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No documents uploaded</p>
              <p className="text-slate-500 text-sm mt-1">Upload letters, court documents, contracts, or legal notices.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center gap-4 hover:border-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <File className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{doc.filename}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {(doc.metadata as any)?.char_count?.toLocaleString() ?? '?'} chars ·{' '}
                      {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {doc.file_type}
                  </span>
                  <button onClick={() => setViewing(doc)}
                    className="p-2 text-slate-500 hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-500/10">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewing(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <p className="text-white font-medium">{viewing.filename}</p>
              <button onClick={() => setViewing(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto p-5 flex-1">
              <pre className="text-slate-300 text-xs whitespace-pre-wrap font-sans leading-relaxed">
                {viewing.content?.slice(0, 10000) ?? 'No content extracted'}
                {(viewing.content?.length ?? 0) > 10000 ? '\n\n[Content truncated — showing first 10,000 characters]' : ''}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
