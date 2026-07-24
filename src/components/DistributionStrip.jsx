import { scorePost } from '../lib/stats'
import './DistributionStrip.css'

export default function DistributionStrip({ posts, hits, emptyHint }) {
  if (posts.length === 0) {
    return (
      <div className="strip strip--empty">
        <span>{emptyHint || 'Add your first post to see the shape.'}</span>
      </div>
    )
  }

  const scores = posts.map(scorePost)
  const max = Math.max(...scores, 1)

  return (
    <div className="strip" role="img" aria-label="Distribution of post performance, most bars short, a few tall">
      <div className="strip__bars">
        {posts.map((p, i) => {
          const s = scores[i]
          const heightPct = Math.max(4, (s / max) * 100)
          const isHit = hits?.has(p.id)
          return (
            <div className="strip__col" key={p.id} title={`${p.label || 'Post'}: ${s.toFixed(0)} pts`}>
              <div
                className={`strip__bar ${isHit ? 'strip__bar--hit' : ''}`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="strip__baseline" />
    </div>
  )
}
