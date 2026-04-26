interface ProgressBarProps {
  pct: number
  color: 'green' | 'yellow' | 'orange' | 'red'
  label?: string
  daysRemaining?: number
}

const colorMap = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
}
const labelMap = {
  green: 'On track',
  yellow: 'Mid-period',
  orange: 'Almost due',
  red: 'Overdue',
}

export default function ProgressBar({ pct, color, daysRemaining }: ProgressBarProps) {
  const barColor = colorMap[color]
  const statusLabel = labelMap[color]

  return (
    <div className="px-3 pb-2.5">
      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full prog-bar ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-stone-400">{statusLabel}</span>
        <span className="text-xs text-stone-400">
          {daysRemaining !== undefined
            ? daysRemaining < 0
              ? `${Math.abs(daysRemaining)}d overdue`
              : daysRemaining === 0
              ? 'Due today'
              : `${daysRemaining}d remaining`
            : `${pct}% elapsed`}
        </span>
      </div>
    </div>
  )
}
