import { useQuery } from '@tanstack/react-query'
import { fetchIssuances, fetchBooks } from '../lib/api'
import IssuedTable from '../components/IssuedTable'

interface Props {
  search: string
  filterLang: number[]
  filterCat: number[]
}

export default function IssuedBooks({ search, filterLang, filterCat }: Props) {
  const { data: issuances = [], isLoading } = useQuery({
    queryKey: ['issuances', { active_only: false }],
    queryFn: () => fetchIssuances({ active_only: false }),
    refetchInterval: 30_000,
  })
  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: fetchBooks })

  let filtered = issuances
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(i =>
      i.book_title.toLowerCase().includes(q) ||
      i.student_name.toLowerCase().includes(q) ||
      i.roll_no.toLowerCase().includes(q)
    )
  }
  if (filterLang.length) {
    const bookIds = new Set(books.filter(b => filterLang.includes(b.language_id)).map(b => b.id))
    filtered = filtered.filter(i => bookIds.has(i.book_id))
  }
  if (filterCat.length) {
    const bookIds = new Set(books.filter(b => filterCat.includes(b.category_id)).map(b => b.id))
    filtered = filtered.filter(i => bookIds.has(i.book_id))
  }

  const active = filtered.filter(i => !i.returned_at)
  const returned = filtered.filter(i => i.returned_at)

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-ink">Currently Issued</h2>
          <span className="bg-stone-100 border border-stone-200 text-stone-500 text-xs px-2 py-0.5 rounded-full">{active.length}</span>
        </div>
        {isLoading ? (
          <div className="card p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : (
          <IssuedTable issuances={active} />
        )}
      </div>

      {returned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-stone-400">Returned</h2>
            <span className="bg-stone-100 border border-stone-200 text-stone-400 text-xs px-2 py-0.5 rounded-full">{returned.length}</span>
          </div>
          <div className="card overflow-hidden opacity-60">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-100">
                <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-2.5">Book</th>
                <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-2.5">Student</th>
                <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-2.5">Class</th>
                <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-2.5">Returned</th>
              </tr></thead>
              <tbody>
                {returned.map(i => (
                  <tr key={i.id} className="border-t border-stone-50">
                    <td className="px-3 py-2.5 text-stone-500">{i.book_title}</td>
                    <td className="px-3 py-2.5 text-stone-500">{i.student_name}</td>
                    <td className="px-3 py-2.5 text-stone-400">{i.student_class}</td>
                    <td className="px-3 py-2.5 text-stone-400 text-xs">
                      {i.returned_at ? new Date(i.returned_at).toLocaleDateString() : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
