import './PostHistoryChart.css'

export default function PostHistoryChart({ post }) {
  const readings = [
    ...(post.snapshots || []).map((s) => ({
      measuredAt: s.measuredAt,
      impressions: s.impressions ?? 0,
      reactions: s.reactions ?? 0,
      comments: s.comments ?? 0,
    })),
    {
      measuredAt: post.measuredAt || post.date,
      impressions: post.impressions ?? 0,
      reactions: post.reactions ?? 0,
      comments: post.comments ?? 0,
    },
  ].sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt))

  if (readings.length < 2) return null

  const width = 320
  const height = 90
  const padding = { top: 10, right: 10, bottom: 20, left: 10 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const times = readings.map((r) => new Date(r.measuredAt).getTime())
  const minT = Math.min(...times)
  const maxT = Math.max(...times)
  const tSpan = maxT - minT || 1

  const maxImpressions = Math.max(...readings.map((r) => r.impressions), 1)

  function xFor(t) {
    return padding.left + ((t - minT) / tSpan) * plotW
  }
  function yFor(v) {
    return padding.top + plotH - (v / maxImpressions) * plotH
  }

  const points = readings.map((r) => `${xFor(new Date(r.measuredAt).getTime())},${yFor(r.impressions)}`).join(' ')

  const first = readings[0]
  const last = readings[readings.length - 1]
  const growthPct = first.impressions > 0 ? Math.round(((last.impressions - first.impressions) / first.impressions) * 100) : null

  return (
    <div className="phist">
      <div className="phist__header">
        <span className="phist__title">Impressions over time</span>
        {growthPct !== null && (
          <span className={`phist__growth ${growthPct >= 0 ? 'phist__growth--up' : 'phist__growth--down'}`}>
            {growthPct >= 0 ? '+' : ''}
            {growthPct}% since first reading
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="phist__svg" role="img" aria-label="Impressions growth over time">
        <polyline points={points} className="phist__line" />
        {readings.map((r, i) => {
          const cx = xFor(new Date(r.measuredAt).getTime())
          const cy = yFor(r.impressions)
          const isLast = i === readings.length - 1
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={isLast ? 4 : 3} className={isLast ? 'phist__dot phist__dot--last' : 'phist__dot'} />
            </g>
          )
        })}
      </svg>
      <div className="phist__readings">
        {readings.map((r, i) => (
          <div className="phist__reading" key={i}>
            <span className="phist__reading-date">{new Date(r.measuredAt).toLocaleDateString()}</span>
            <span className="phist__reading-stats">
              {r.impressions} impressions · {r.reactions} reactions · {r.comments} comments
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
