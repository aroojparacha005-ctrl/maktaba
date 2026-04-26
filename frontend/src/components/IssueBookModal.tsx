import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBooks, createIssuance } from '../lib/api'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { format, addDays } from 'date-fns'

interface Props {
  onClose: () => void
  preselectedBookId?: number
}

export default function IssueBookModal({ onClose, preselectedBookId }: Props) {
  const qc = useQueryClient()
  const today = new Date()
  const { data: books = [] } = useQuery({
    queryKey: ['books', { is_issued: false }],
    queryFn: () => fetchBooks({ is_issued: false }),
  })

  const [bookId, setBookId] = useState<number>(preselectedBookId ?? 0)
  const [studentName, setStudentName] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [issueDate, setIssueDate] = useState(format(today, 'yyyy-MM-dd'))
  const [dueDate, setDueDate] = useState(format(addDays(today, 14), 'yyyy-MM-dd'))

  const mut = useMutation({
    mutationFn: createIssuance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] })
      qc.invalidateQueries({ queryKey: ['issuances'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Book issued successfully!')
      onClose()
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed to issue book'),
  })

  const submit = () => {
    if (!bookId) return toast.error('Select a book')
    if (!studentName.trim()) return toast.error('Student name is required')
    if (!studentClass.trim()) return toast.error('Class is required')
    if (!rollNo.trim()) return toast.error('Roll no. is required')
    if (!issueDate || !dueDate) return toast.error('Dates are required')
    if (dueDate <= issueDate) return toast.error('Due date must be after issue date')
    mut.mutate({
      book_id: bookId,
      student_name: studentName.trim(),
      student_class: studentClass.trim(),
      roll_no: rollNo.trim(),
      issue_date: issueDate,
      due_date: dueDate,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-base font-serif">Issue Book</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-50"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Book</label>
            <select className="input" value={bookId} onChange={e => setBookId(Number(e.target.value))}>
              <option value={0}>Select available book…</option>
              {books.filter(b => !b.is_issued).map(b => (
                <option key={b.id} value={b.id}>{b.title} [{b.language}]</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Student Name</label>
            <input className="input" placeholder="Full name" value={studentName} onChange={e => setStudentName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Class</label>
              <input className="input" placeholder="e.g. 2-A" value={studentClass} onChange={e => setStudentClass(e.target.value)} />
            </div>
            <div>
              <label className="label">Roll No.</label>
              <input className="input" placeholder="Roll #" value={rollNo} onChange={e => setRollNo(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Issue Date</label>
              <input type="date" className="input" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-stone-100">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            disabled={mut.isPending}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {mut.isPending ? 'Issuing…' : 'Issue Book'}
          </button>
        </div>
      </div>
    </div>
  )
}
