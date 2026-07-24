import { useState } from 'react'
import { METRIC_GROUPS } from '../lib/metricSchema'
import './PostEditForm.css'

export default function PostEditForm({ post, onSave, onCancel }) {
  const [form, setForm] = useState({
    label: post.label,
    date: post.date,
    note: post.note || '',
    ...Object.fromEntries(METRIC_GROUPS.flatMap((g) => g.fields).map((f) => [f.key, post[f.key] ?? 0])),
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const metrics = {}
    METRIC_GROUPS.forEach((g) =>
      g.fields.forEach((f) => {
        metrics[f.key] = Number(form[f.key]) || 0
      })
    )
    onSave({
      ...post,
      label: form.label.trim() || 'Untitled post',
      date: form.date,
      note: form.note.trim(),
      ...metrics,
    })
  }

  return (
    <form className="pedit" onSubmit={handleSubmit}>
      <div className="pedit__row">
        <label className="pedit__field pedit__field--wide">
          <span>What was it</span>
          <input type="text" value={form.label} onChange={(e) => update('label', e.target.value)} autoFocus />
        </label>
        <label className="pedit__field">
          <span>Date</span>
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        </label>
      </div>

      {METRIC_GROUPS.map((group) => (
        <div className="pedit__group" key={group.group}>
          <span className="pedit__group-label">{group.group}</span>
          <div className="pedit__row pedit__row--metrics">
            {group.fields.map((f) => (
              <label className="pedit__field" key={f.key} title={f.help}>
                <span>{f.label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      <label className="pedit__field pedit__field--wide">
        <span>Note (optional)</span>
        <input type="text" value={form.note} onChange={(e) => update('note', e.target.value)} />
      </label>

      <div className="pedit__actions">
        <button type="button" className="pedit__cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pedit__save">
          Save changes
        </button>
      </div>
    </form>
  )
}
