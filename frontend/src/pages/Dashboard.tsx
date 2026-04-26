import { useQuery } from '@tanstack/react-query'
import { fetchBooks, fetchIssuances, Issuance } from '../lib/api'
import UrgentPanel from '../components/UrgentPanel'
import IssuedTable from '../components/IssuedTable'

interface Props {
  search: string
  filterLang: number[]
  filterCat: number[]
  urgentIssuances: Issuance[]
  onIssue: (bookId?: number) => void
}

export default function Dashboard({ search, filterLang, filterCat, urgentIssuances, onIssue }: Props) {
  const { data: issuances = [], isLoading } = useQuery({
    queryKey: ['issuances', { active_only: true }],
    queryFn: () => fetchIssuances({ active_only: true }),
    refetchInterval: 30_000,
  })

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => fetchBooks(),
  })

  // Filter issuances
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
    const langIds = new Set(filterLang)
    const bookIds = new Set(books.filter(b => langIds.has(b.language_id)).map(b => b.id))
    filtered = filtered.filter(i => bookIds.has(i.book_id))
  }
  if (filterCat.length) {
    const catIds = new Set(filterCat)
    const bookIds = new Set(books.filter(b => catIds.has(b.category_id)).map(b => b.id))
    filtered = filtered.filter(i => bookIds.has(i.book_id))
  }

  // Available books
  const issuedBookIds = new Set(issuances.map(i => i.book_id))
  let availBooks = books.filter(b => !issuedBookIds.has(b.id))
  if (search) {
    const q = search.toLowerCase()
    availBooks = availBooks.filter(b => b.title.toLowerCase().includes(q))
  }
  if (filterLang.length) availBooks = availBooks.filter(b => filterLang.includes(b.language_id))
  if (filterCat.length) availBooks = availBooks.filter(b => filterCat.includes(b.category_id))

  return (
    <div>
      <UrgentPanel issuances={urgentIssuances} />

      {/* Issued Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-ink">Active Issuances</h2>
          <span className="bg-stone-100 border border-stone-200 text-stone-500 text-xs px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </div>
        {isLoading ? (
          <div className="card p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : (
          <IssuedTable issuances={filtered} />
        )}
      </div>

      {/* Available Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-ink">Available Books</h2>
          <span className="bg-stone-100 border border-stone-200 text-stone-500 text-xs px-2 py-0.5 rounded-full">
            {availBooks.length}
          </span>
        </div>
        {availBooks.length === 0 ? (
          <div className="card p-8 text-center text-stone-400 text-sm">No available books match your filters.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availBooks.map(b => (
              <div
                key={b.id}
                className="card p-3.5 cursor-pointer hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-150"
                onClick={() => onIssue(b.id)}
              >
                <div className="font-medium text-sm text-ink mb-2 leading-tight">{b.title}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="lang-tag">{b.language}</span>
                  <span className="cat-tag">{b.category}</span>
                </div>
                <div className="text-xs text-blue-500 font-medium">Tap to issue →</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
