import './CycleSummary.css'

function fmt(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return Math.round(n).toString()
}

export default function CycleSummary({ summary, cycleSize, currentCount, readiness }) {
  const remaining = Math.max(0, cycleSize - currentCount)

  return (
    <div className="csum">
      <div className="csum__stat">
        <span className="csum__label">Posts logged</span>
        <span className="csum__value">{summary.count}</span>
      </div>
      <div className="csum__stat">
        <span className="csum__label">Top post share</span>
        <span className="csum__value">{summary.count > 0 ? `${Math.round(summary.hitShare * 100)}%` : '—'}</span>
      </div>
      <div className="csum__stat">
        <span className="csum__label">Median score</span>
        <span className="csum__value">{summary.count > 0 ? fmt(summary.medianScore) : '—'}</span>
      </div>
      <div className="csum__stat">
        <span className="csum__label">Best score</span>
        <span className="csum__value">{summary.count > 0 ? fmt(summary.maxScore) : '—'}</span>
      </div>
      <div className={`csum__readiness csum__readiness--${readiness.tone}`}>
        {readiness.label}
        {remaining > 0 && currentCount > 0 && (
          <span className="csum__remaining"> · {remaining} more to close this cycle</span>
        )}
      </div>
    </div>
  )
}
