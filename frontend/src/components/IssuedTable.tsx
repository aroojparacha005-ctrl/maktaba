import { useMutation, useQueryClient } from '@tanstack/react-query'
import { returnBook, Issuance } from '../lib/api'
import ProgressBar from './ProgressBar'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Props {
  issuances: Issuance[]
  showBookInfo?: boolean
}

export default function IssuedTable({ issuances, showBookInfo = true }: Props) {
  const qc = useQueryClient()
  const returnMut = useMutation({
    mutationFn: returnBook,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] })
      qc.invalidateQueries({ queryKey: ['issuances'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Book returned successfully')
    },
    onError: () => toast.error('Failed to return book'),
  })

  const fmt = (d: string) => format(new Date(d), 'd MMM')

  if (!issuances.length) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-sm">No issued books found.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '28%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '23%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-stone-100">
            <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-3">Book Title</th>
            <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-3">Student</th>
            <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-3">Class</th>
            <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-3">Issue Date</th>
            <th className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wider px-3 py-3">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {issuances.map((iss, idx) => (
            <>
              {/* Row 1: Data */}
              <tr key={`data-${iss.id}`} className={`hover:bg-stone-50 transition-colors ${idx > 0 ? 'border-t border-stone-100' : ''}`}>
                <td className="px-3 pt-3 pb-1 align-middle">
                  <div className="font-medium text-sm text-ink leading-tight">{iss.book_title}</div>
                  {showBookInfo && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className="lang-tag">{iss.book_language}</span>
                      <span className="cat-tag">{iss.book_category}</span>
                    </div>
                  )}
                </td>
                <td className="px-3 pt-3 pb-1 align-middle">
                  <div className="font-medium text-sm">{iss.student_name}</div>
                  <div className="text-xs text-stone-400">Roll #{iss.roll_no}</div>
                </td>
                <td className="px-3 pt-3 pb-1 align-middle">
                  <span className="bg-stone-100 border border-stone-200 rounded px-2 py-0.5 text-xs font-medium text-stone-600">
                    {iss.student_class}
                  </span>
                </td>
                <td className="px-3 pt-3 pb-1 align-middle text-xs text-stone-500">
                  {fmt(iss.issue_date)}
                </td>
                <td className="px-3 pt-3 pb-1 align-middle">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-medium ${
                      iss.progress_color === 'red' ? 'text-red-600' :
                      iss.progress_color === 'orange' ? 'text-orange-600' : 'text-stone-600'
                    }`}>
                      {fmt(iss.due_date)}
                      {(iss.days_remaining ?? 0) < 0 && (
                        <span className="ml-1 text-xs font-normal text-red-400">
                          ({Math.abs(iss.days_remaining!)}d over)
                        </span>
                      )}
                      {(iss.days_remaining ?? 99) <= 2 && (iss.days_remaining ?? 99) >= 0 && (
                        <span className="ml-1 text-xs font-normal text-orange-400">
                          ({iss.days_remaining}d)
                        </span>
                      )}
                    </span>
                    <button
                      className="text-xs border border-stone-200 rounded px-2 py-0.5 text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors whitespace-nowrap disabled:opacity-40"
                      onClick={() => returnMut.mutate(iss.id)}
                      disabled={returnMut.isPending}
                    >
                      Return
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2: Progress bar (colspan=5) */}
              <tr key={`prog-${iss.id}`}>
                <td colSpan={5} className="p-0">
                  <ProgressBar
                    pct={iss.progress_pct ?? 0}
                    color={iss.progress_color ?? 'green'}
                    daysRemaining={iss.days_remaining}
                  />
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
