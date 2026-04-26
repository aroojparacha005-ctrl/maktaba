import { Issuance } from '../lib/api'

interface Props {
  issuances: Issuance[]
}

export default function UrgentPanel({ issuances }: Props) {
  if (!issuances.length) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
        <h2 className="text-xs font-semibold text-red-600 uppercase tracking-widest font-sans">
          🔔 Urgent Reminders
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {issuances.map(iss => {
          const d = iss.days_remaining ?? 0
          const badge = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Today' : `${d}d left`
          return (
            <div key={iss.id} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs">
              <strong className="block text-red-600 text-sm">{iss.student_name}</strong>
              <span className="text-stone-500">{iss.student_class} · {iss.book_title}</span>
              <br />
              <span className="inline-block mt-1 bg-red-600 text-white rounded px-1.5 py-0.5 text-xs font-semibold">
                {badge}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
