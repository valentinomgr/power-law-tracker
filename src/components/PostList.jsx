import './PostList.css'

export default function PostList({ posts, hits, onDelete }) {
  if (posts.length === 0) return null

  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="plist">
      {sorted.map((p) => {
        const isHit = hits?.has(p.id)
        return (
          <div className={`plist__row ${isHit ? 'plist__row--hit' : ''}`} key={p.id}>
            <div className="plist__main">
              <span className="plist__label">
                {p.label}
                {isHit && <span className="plist__badge">Outlier</span>}
                {p.snapshots?.length > 0 && (
                  <span className="plist__badge plist__badge--muted" title="Number of earlier readings kept in history">
                    {p.snapshots.length + 1} readings
                  </span>
                )}
              </span>
              <span className="plist__date">
                Posted {p.date}
                {p.measuredAt && ` · measured ${new Date(p.measuredAt).toLocaleDateString()}`}
              </span>
            </div>
            <div className="plist__metrics">
              <span title="Impressions">{p.impressions ?? 0} impressions</span>
              <span title="Members reached">{p.membersReached ?? 0} reached</span>
              <span title="Reactions">{p.reactions ?? 0} reactions</span>
              <span title="Comments">{p.comments ?? 0} comments</span>
              <span title="Reposts">{p.reposts ?? 0} reposts</span>
              <span title="Saves">{p.saves ?? 0} saves</span>
              <span title="Sends on LinkedIn">{p.sends ?? 0} sends</span>
              {(p.profileViews > 0 || p.followersGained > 0) && (
                <span title="Profile activity" className="plist__metric--highlight">
                  {p.profileViews ?? 0} profile views · {p.followersGained ?? 0} new followers
                </span>
              )}
            </div>
            {p.note && <div className="plist__note">{p.note}</div>}
            <button
              className="plist__delete"
              onClick={() => onDelete(p.id)}
              aria-label={`Delete ${p.label}`}
              title="Delete"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
