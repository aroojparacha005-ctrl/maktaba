import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchLanguages, fetchCategories, createBook } from '../lib/api'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Props { onClose: () => void }

export default function AddBookModal({ onClose }: Props) {
  const qc = useQueryClient()
  const { data: languages = [] } = useQuery({ queryKey: ['languages'], queryFn: fetchLanguages })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const [title, setTitle] = useState('')
  const [langId, setLangId] = useState<number>(0)
  const [catId, setCatId] = useState<number>(0)

  const mut = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Book added!')
      onClose()
    },
    onError: () => toast.error('Failed to add book'),
  })

  const submit = () => {
    if (!title.trim()) return toast.error('Title is required')
    if (!langId) return toast.error('Select a language')
    if (!catId) return toast.error('Select a category')
    mut.mutate({ title: title.trim(), language_id: langId, category_id: catId })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-base font-serif">Add New Book</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-50"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Book Title</label>
            <input className="input" placeholder="Enter book title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Language</label>
              <select className="input" value={langId} onChange={e => setLangId(Number(e.target.value))}>
                <option value={0}>Select…</option>
                {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sub-category</label>
              <select className="input" value={catId} onChange={e => setCatId(Number(e.target.value))}>
                <option value={0}>Select…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-stone-100">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={mut.isPending}>
            {mut.isPending ? 'Adding…' : 'Add Book'}
          </button>
        </div>
      </div>
    </div>
  )
}
