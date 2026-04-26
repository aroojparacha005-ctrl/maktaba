import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, BookCheck, Library, Settings, Bell, Search } from 'lucide-react'
import { fetchLanguages, fetchCategories, fetchDashboardStats } from './lib/api'
import Dashboard from './pages/Dashboard'
import IssuedBooks from './pages/IssuedBooks'
import AvailableBooks from './pages/AvailableBooks'
import SettingsPage from './pages/Settings'
import AddBookModal from './components/AddBookModal'
import AddCategoryModal from './components/AddCategoryModal'
import IssueBookModal from './components/IssueBookModal'

type View = 'dashboard' | 'issued' | 'available' | 'settings'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [search, setSearch] = useState('')
  const [filterLang, setFilterLang] = useState<number[]>([])
  const [filterCat, setFilterCat] = useState<number[]>([])
  const [modal, setModal] = useState<'book' | 'category' | 'issue' | null>(null)
  const [preselectedBookId, setPreselectedBookId] = useState<number | undefined>()

  const { data: languages = [] } = useQuery({ queryKey: ['languages'], queryFn: fetchLanguages })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchDashboardStats, refetchInterval: 60_000 })

  const toggleLang = (id: number) =>
    setFilterLang(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleCat = (id: number) =>
    setFilterCat(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const openIssue = (bookId?: number) => {
    setPreselectedBookId(bookId)
    setModal('issue')
  }

  const navItems: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'All Books', icon: <Library size={16} /> },
    { key: 'issued', label: 'Issued Books', icon: <BookOpen size={16} /> },
    { key: 'available', label: 'Available Books', icon: <BookCheck size={16} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-parchment">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-stone-200 flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-5 border-b border-stone-100">
          <h1 className="font-serif text-base text-ink leading-tight">Maktaba</h1>
          <span className="text-xs text-stone-400 tracking-widest uppercase">Library System</span>
        </div>

        <nav className="p-2.5 flex flex-col gap-0.5">
          <p className="text-xs text-stone-400 uppercase tracking-widest px-2 py-2">Views</p>
          {navItems.map(item => (
            <div
              key={item.key}
              className={`nav-item ${view === item.key ? 'active' : ''}`}
              onClick={() => setView(item.key)}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </nav>

        {/* Filters */}
        <div className="px-2.5 py-3 border-t border-stone-100">
          <p className="text-xs text-stone-400 uppercase tracking-widest px-2 mb-2">Language</p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {languages.map(l => (
              <div key={l.id} className={`chip ${filterLang.includes(l.id) ? 'active' : ''}`} onClick={() => toggleLang(l.id)}>
                {l.name}
              </div>
            ))}
          </div>
        </div>

        <div className="px-2.5 py-3 border-t border-stone-100">
          <p className="text-xs text-stone-400 uppercase tracking-widest px-2 mb-2">Category</p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {categories.map(c => (
              <div key={c.id} className={`chip ${filterCat.includes(c.id) ? 'active' : ''}`} onClick={() => toggleCat(c.id)}>
                {c.name}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-2.5 mt-auto border-t border-stone-100 flex flex-col gap-2">
          <button className="btn-primary text-left text-xs py-2 px-3" onClick={() => setModal('book')}>+ Add New Book</button>
          <button className="btn-secondary text-left text-xs py-2 px-3" onClick={() => setModal('category')}>+ Add Category</button>
          <button onClick={() => openIssue()} className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors text-left">
            + Issue Book
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-stone-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              className="input pl-9 bg-stone-50 text-sm"
              placeholder="Search book, student, or roll no…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 ml-auto">
            {[
              { label: 'Total', val: stats?.total_books ?? '–', color: 'text-stone-700' },
              { label: 'Issued', val: stats?.issued_books ?? '–', color: 'text-blue-700' },
              { label: 'Available', val: stats?.available_books ?? '–', color: 'text-emerald-700' },
              { label: 'Overdue', val: stats?.overdue_books ?? '–', color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-stone-50 border border-stone-200 rounded-full px-3 py-1 text-xs">
                <span className="text-stone-400">{s.label}: </span>
                <strong className={s.color}>{s.val}</strong>
              </div>
            ))}
            {(stats?.urgent_issuances?.length ?? 0) > 0 && (
              <div className="relative">
                <Bell size={18} className="text-red-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-content-center leading-none text-center">
                  {stats!.urgent_issuances.length}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {view === 'dashboard' && (
            <Dashboard
              search={search}
              filterLang={filterLang}
              filterCat={filterCat}
              urgentIssuances={stats?.urgent_issuances ?? []}
              onIssue={openIssue}
            />
          )}
          {view === 'issued' && (
            <IssuedBooks search={search} filterLang={filterLang} filterCat={filterCat} />
          )}
          {view === 'available' && (
            <AvailableBooks
              search={search}
              filterLang={filterLang}
              filterCat={filterCat}
              onIssue={openIssue}
            />
          )}
          {view === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Modals */}
      {modal === 'book' && <AddBookModal onClose={() => setModal(null)} />}
      {modal === 'category' && <AddCategoryModal onClose={() => setModal(null)} />}
      {modal === 'issue' && (
        <IssueBookModal preselectedBookId={preselectedBookId} onClose={() => { setModal(null); setPreselectedBookId(undefined) }} />
      )}
    </div>
  )
}
