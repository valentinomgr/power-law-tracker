import { useState, useRef } from 'react'
import { METRIC_GROUPS, emptyMetrics } from '../lib/metricSchema'
import { parseLinkedInXlsx } from '../lib/linkedinImport'
import './PostForm.css'

function emptyForm() {
  return {
    label: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    postUrl: '',
    ...emptyMetrics(),
  }
}

function labelFromPostUrl(url) {
  if (!url) return null
  const slug = url.split('/').filter(Boolean).pop()
  if (!slug) return null
  // LinkedIn slugs look like:
  // valentin-pyatenko_most-advice-about-risk-vs-consistency-share-7486397811144589313-VlxG
  // Strip the "-share-<id>-<code>" suffix and any author-name prefix before
  // the first underscore, then turn dashes into spaces and title-case it.
  const withoutSuffix = slug.replace(/-share-\d+-[A-Za-z0-9]+$/, '')
  const afterAuthor = withoutSuffix.includes('_') ? withoutSuffix.split('_').slice(1).join('_') : withoutSuffix
  const words = afterAuthor.split(/[-_]+/).filter(Boolean)
  if (words.length === 0) return null
  const text = words.join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export default function PostForm({ onAdd, existingPosts = [] }) {
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [importError, setImportError] = useState('')
  const [importedFrom, setImportedFrom] = useState('')
  const [duplicateOf, setDuplicateOf] = useState(null)
  const fileInputRef = useRef(null)

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
    onAdd(
      {
        id: duplicateOf ? duplicateOf.id : crypto.randomUUID(),
        label: form.label.trim() || 'Untitled post',
        date: form.date,
        note: form.note.trim(),
        postUrl: form.postUrl || null,
        measuredAt: new Date().toISOString(),
        ...metrics,
      },
      duplicateOf
    )
    setForm(emptyForm())
    setImportedFrom('')
    setDuplicateOf(null)
    setOpen(false)
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    setDuplicateOf(null)
    try {
      const parsed = await parseLinkedInXlsx(file)
      setForm((f) => ({
        ...f,
        label: f.label || labelFromPostUrl(parsed.postUrl) || 'Imported post',
        date: parsed.date || f.date,
        postUrl: parsed.postUrl || f.postUrl,
        ...parsed.metrics,
      }))
      setImportedFrom(file.name)

      if (parsed.postUrl) {
        const existing = existingPosts.find((p) => p.postUrl === parsed.postUrl)
        if (existing) {
          setDuplicateOf(existing)
        }
      }

      setOpen(true)
    } catch (err) {
      setImportError(err.message || 'Could not read that file. Make sure it\'s a LinkedIn "Post analytics" export.')
    } finally {
      e.target.value = ''
    }
  }

  if (!open) {
    return (
      <div className="post-form__toggles">
        <button className="post-form__toggle" onClick={() => setOpen(true)}>
          + Log a post
        </button>
        <button className="post-form__toggle post-form__toggle--secondary" onClick={() => fileInputRef.current?.click()}>
          Import from LinkedIn .xlsx
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {importError && <div className="post-form__error">{importError}</div>}
      </div>
    )
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {importedFrom && !duplicateOf && (
        <div className="post-form__imported">
          Filled in from <strong>{importedFrom}</strong> — check the numbers below, then add.
        </div>
      )}
      {duplicateOf && (
        <div className="post-form__duplicate">
          This looks like the same post as <strong>{duplicateOf.label}</strong>, logged{' '}
          {new Date(duplicateOf.measuredAt || duplicateOf.date).toLocaleDateString()} with{' '}
          {duplicateOf.impressions ?? 0} impressions. Submitting will update it to a new snapshot with today's
          numbers and keep the earlier reading in its history — it won't count as a second post.
        </div>
      )}
      {importError && <div className="post-form__error">{importError}</div>}

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

      {METRIC_GROUPS.map((group) => (
        <div className="post-form__group" key={group.group}>
          <span className="post-form__group-label">{group.group}</span>
          <div className="post-form__row post-form__row--metrics">
            {group.fields.map((f) => (
              <label className="post-form__field" key={f.key} title={f.help}>
                <span>{f.label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="0"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
      ))}

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
        <button
          type="button"
          className="post-form__cancel"
          onClick={() => {
            setOpen(false)
            setForm(emptyForm())
            setImportedFrom('')
            setImportError('')
            setDuplicateOf(null)
          }}
        >
          Cancel
        </button>
        <button type="submit" className="post-form__submit">
          {duplicateOf ? 'Update with new snapshot' : 'Add post'}
        </button>
      </div>
    </form>
  )
}
