import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchLanguages, fetchCategories,
  createLanguage, createCategory,
  deleteLanguage, deleteCategory,
} from '../lib/api'
import toast from 'react-hot-toast'
import { Trash2, Plus } from 'lucide-react'

export default function SettingsPage() {
  const qc = useQueryClient()
  const { data: languages = [] } = useQuery({ queryKey: ['languages'], queryFn: fetchLanguages })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

  const [newLang, setNewLang] = useState('')
  const [newCat, setNewCat] = useState('')

  const addLang = useMutation({
    mutationFn: createLanguage,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['languages'] }); setNewLang(''); toast.success('Language added') },
    onError: () => toast.error('Already exists or error'),
  })
  const delLang = useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['languages'] }); toast.success('Deleted') },
    onError: () => toast.error('Cannot delete — books use this language'),
  })
  const addCat = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setNewCat(''); toast.success('Category added') },
    onError: () => toast.error('Already exists or error'),
  })
  const delCat = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Deleted') },
    onError: () => toast.error('Cannot delete — books use this category'),
  })

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-serif text-xl mb-1">Settings</h1>
        <p className="text-sm text-stone-400">Manage languages and sub-categories</p>
      </div>

      {/* Languages */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Languages</h2>
        <div className="space-y-2 mb-4">
          {languages.map(l => (
            <div key={l.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
              <span className="text-sm text-ink">{l.name}</span>
              <button
                onClick={() => { if (confirm(`Delete "${l.name}"?`)) delLang.mutate(l.id) }}
                className="text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {languages.length === 0 && <p className="text-sm text-stone-400">No languages yet.</p>}
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="New language name"
            value={newLang}
            onChange={e => setNewLang(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && newLang.trim() && addLang.mutate(newLang.trim())}
          />
          <button
            className="btn-primary flex items-center gap-1"
            onClick={() => newLang.trim() && addLang.mutate(newLang.trim())}
            disabled={addLang.isPending}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Sub-categories</h2>
        <div className="space-y-2 mb-4">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
              <span className="text-sm text-ink">{c.name}</span>
              <button
                onClick={() => { if (confirm(`Delete "${c.name}"?`)) delCat.mutate(c.id) }}
                className="text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-stone-400">No categories yet.</p>}
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="New category name"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && newCat.trim() && addCat.mutate(newCat.trim())}
          />
          <button
            className="btn-primary flex items-center gap-1"
            onClick={() => newCat.trim() && addCat.mutate(newCat.trim())}
            disabled={addCat.isPending}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="card p-5 bg-blue-50 border-blue-100">
        <h2 className="text-sm font-semibold text-blue-800 mb-2">API Documentation</h2>
        <p className="text-xs text-blue-600 mb-2">The FastAPI backend provides interactive docs at:</p>
        <code className="block text-xs bg-white border border-blue-200 rounded px-3 py-2 text-blue-700">
          http://localhost:8000/docs
        </code>
        <p className="text-xs text-blue-600 mt-2">Or ReDoc at: <code className="bg-white border border-blue-200 rounded px-1">/redoc</code></p>
      </div>
    </div>
  )
}
