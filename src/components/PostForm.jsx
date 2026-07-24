import { useState } from 'react'
import './PostForm.css'

const empty = {
  label: '',
  date: new Date().toISOString().slice(0, 10),
  views: '',
  likes: '',
  comments: '',
  shares: '',
  note: '',
}

export default function PostForm({ onAdd }) {
  const [form, setForm] = useState(empty)
  const [open, setOpen] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onAdd({
      id: crypto.randomUUID(),
      label: form.label.trim() || 'Untitled post',
      date: form.date,
      views: Number(form.views) || 0,
      likes: Number(form.likes) || 0,
      comments: Number(form.comments) || 0,
      shares: Number(form.shares) || 0,
      note: form.note.trim(),
    })
    setForm(empty)
    setOpen(false)
  }

  if (!open) {
    return (
      <button className="post-form__toggle" onClick={() => setOpen(true)}>
        + Log a post
      </button>
    )
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="post-form__row">
        <label className="post-form__field post-form__field--wide">
          <span>What was it</span>
          <input
            type="text"
            placeholder="e.g. Power law hook post"
            value={form.label}
            onChange={(e) => update('label', e.target.value)}
            autoFocus
          />
        </label>
        <label className="post-form__field">
          <span>Date</span>
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        </label>
      </div>

      <div className="post-form__row post-form__row--metrics">
        <label className="post-form__field">
          <span>Views</span>
          <input type="number" inputMode="numeric" min="0" placeholder="0" value={form.views} onChange={(e) => update('views', e.target.value)} />
        </label>
        <label className="post-form__field">
          <span>Likes</span>
          <input type="number" inputMode="numeric" min="0" placeholder="0" value={form.likes} onChange={(e) => update('likes', e.target.value)} />
        </label>
        <label className="post-form__field">
          <span>Comments</span>
          <input type="number" inputMode="numeric" min="0" placeholder="0" value={form.comments} onChange={(e) => update('comments', e.target.value)} />
        </label>
        <label className="post-form__field">
          <span>Shares</span>
          <input type="number" inputMode="numeric" min="0" placeholder="0" value={form.shares} onChange={(e) => update('shares', e.target.value)} />
        </label>
      </div>

      <label className="post-form__field post-form__field--wide">
        <span>Note (optional)</span>
        <input
          type="text"
          placeholder="Anything you noticed"
          value={form.note}
          onChange={(e) => update('note', e.target.value)}
        />
      </label>

      <div className="post-form__actions">
        <button type="button" className="post-form__cancel" onClick={() => { setOpen(false); setForm(empty) }}>
          Cancel
        </button>
        <button type="submit" className="post-form__submit">
          Add post
        </button>
      </div>
    </form>
  )
}
