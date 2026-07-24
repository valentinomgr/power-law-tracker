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
              </span>
              <span className="plist__date">{p.date}</span>
            </div>
            <div className="plist__metrics">
              <span title="Views">{p.views} views</span>
              <span title="Likes">{p.likes} likes</span>
              <span title="Comments">{p.comments} comments</span>
              <span title="Shares">{p.shares} shares</span>
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
