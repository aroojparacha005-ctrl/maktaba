import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBooks, deleteBook } from '../lib/api'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

interface Props {
  search: string
  filterLang: number[]
  filterCat: number[]
  onIssue: (bookId: number) => void
}

export default function AvailableBooks({ search, filterLang, filterCat, onIssue }: Props) {
  const qc = useQueryClient()
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  })

  const deleteMut = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Book deleted')
    },
    onError: () => toast.error('Failed to delete book'),
  })

  let avail = books.filter(b => !b.is_issued)
  if (search) {
    const q = search.toLowerCase()
    avail = avail.filter(b => b.title.toLowerCase().includes(q))
  }
  if (filterLang.length) avail = avail.filter(b => filterLang.includes(b.language_id))
  if (filterCat.length) avail = avail.filter(b => filterCat.includes(b.category_id))

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold text-ink">Available Books</h2>
        <span className="bg-stone-100 border border-stone-200 text-stone-500 text-xs px-2 py-0.5 rounded-full">{avail.length}</span>
      </div>
      {isLoading ? (
        <div className="card p-8 text-center text-stone-400 text-sm">Loading…</div>
      ) : avail.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-stone-400 text-sm">No available books match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {avail.map(b => (
            <div key={b.id} className="card p-3.5 group relative hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-150">
              <button
                onClick={() => {
                  if (confirm(`Delete "${b.title}"?`)) deleteMut.mutate(b.id)
                }}
                className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
              <div className="font-medium text-sm text-ink mb-2 leading-tight pr-5">{b.title}</div>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="lang-tag">{b.language}</span>
                <span className="cat-tag">{b.category}</span>
              </div>
              <button
                onClick={() => onIssue(b.id)}
                className="w-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg py-1.5 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors font-medium"
              >
                Issue Book
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
