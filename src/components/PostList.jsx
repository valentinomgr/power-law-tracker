import { useState } from 'react'
import PostHistoryChart from './PostHistoryChart'
import PostEditForm from './PostEditForm'
import './PostList.css'

export default function PostList({ posts, hits, onDelete, onEdit }) {
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  if (posts.length === 0) return null

  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="plist">
      {sorted.map((p) => {
        const isHit = hits?.has(p.id)
        const hasHistory = p.snapshots?.length > 0
        const isExpanded = expandedId === p.id
        const isEditing = editingId === p.id
        return (
          <div className={`plist__row ${isHit ? 'plist__row--hit' : ''}`} key={p.id}>
            <div className="plist__main">
              <span className="plist__label">
                {p.label}
                {isHit && <span className="plist__badge">Outlier</span>}
                {hasHistory && (
                  <button
                    type="button"
                    className="plist__badge plist__badge--muted plist__badge--button"
                    onClick={() => {
                      setExpandedId(isExpanded ? null : p.id)
                      setEditingId(null)
                    }}
                    title="Show how this post's numbers changed over time"
                  >
                    {p.snapshots.length + 1} readings {isExpanded ? '▴' : '▾'}
                  </button>
                )}
              </span>
              <span className="plist__date">
                Posted {p.date}
                {p.measuredAt && ` · measured ${new Date(p.measuredAt).toLocaleDateString()}`}
              </span>
            </div>
            {!isEditing && (
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
            )}
            {!isEditing && p.note && <div className="plist__note">{p.note}</div>}
            {isExpanded && hasHistory && !isEditing && <PostHistoryChart post={p} />}
            {isEditing ? (
              <PostEditForm
                post={p}
                onCancel={() => setEditingId(null)}
                onSave={(updated) => {
                  onEdit(updated)
                  setEditingId(null)
                }}
              />
            ) : (
              <div className="plist__actions">
                <button className="plist__edit" onClick={() => { setEditingId(p.id); setExpandedId(null) }}>
                  Edit
                </button>
                <button
                  className="plist__delete"
                  onClick={() => onDelete(p.id)}
                  aria-label={`Delete ${p.label}`}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
