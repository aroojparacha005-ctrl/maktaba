import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLanguage, createCategory } from '../lib/api'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Props { onClose: () => void }

export default function AddCategoryModal({ onClose }: Props) {
  const qc = useQueryClient()
  const [type, setType] = useState<'language' | 'category'>('category')
  const [name, setName] = useState('')

  const langMut = useMutation({
    mutationFn: createLanguage,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['languages'] }); toast.success('Language added!'); onClose() },
    onError: () => toast.error('Language already exists or error'),
  })
  const catMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category added!'); onClose() },
    onError: () => toast.error('Category already exists or error'),
  })

  const isPending = langMut.isPending || catMut.isPending

  const submit = () => {
    if (!name.trim()) return toast.error('Name is required')
    if (type === 'language') langMut.mutate(name.trim())
    else catMut.mutate(name.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-base font-serif">Add Category</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-50"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Type</label>
            <select className="input" value={type} onChange={e => setType(e.target.value as 'language' | 'category')}>
              <option value="language">Language</option>
              <option value="category">Sub-category</option>
            </select>
          </div>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              placeholder={type === 'language' ? 'e.g. Arabic' : 'e.g. Science'}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-stone-100">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={isPending}>
            {isPending ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
