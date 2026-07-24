import { METRIC_KEYS } from './metricSchema'

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportCSV(posts) {
  const headers = ['date', 'measuredAt', 'label', 'postUrl', ...METRIC_KEYS, 'note']
  const rows = posts.map((p) =>
    headers
      .map((h) => {
        const v = p[h] ?? ''
        const s = String(v).replace(/"/g, '""')
        return /[",\n]/.test(s) ? `"${s}"` : s
      })
      .join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  download('power-law-tracker-export.csv', csv, 'text/csv')
}

export function exportJSON(posts) {
  download('power-law-tracker-export.json', JSON.stringify(posts, null, 2), 'application/json')
}

// Reads a previously exported JSON file back into memory. Validates loosely —
// requires an array of objects with at least an id and date — and fills in
// any missing metric fields as 0 rather than rejecting the whole file, since
// exports from older versions of the app may be missing newer fields.
export async function importJSON(file) {
  const text = await file.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file isn\'t valid JSON. Make sure it\'s an export from this app.')
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array of posts.')
  }
  const normalized = parsed.map((p, i) => {
    if (typeof p !== 'object' || p === null) {
      throw new Error(`Entry ${i + 1} isn't a valid post record.`)
    }
    const metrics = Object.fromEntries(METRIC_KEYS.map((k) => [k, Number(p[k]) || 0]))
    return {
      id: p.id || crypto.randomUUID(),
      label: p.label || 'Untitled post',
      date: p.date || new Date().toISOString().slice(0, 10),
      note: p.note || '',
      postUrl: p.postUrl || null,
      measuredAt: p.measuredAt || null,
      snapshots: Array.isArray(p.snapshots) ? p.snapshots : [],
      ...metrics,
    }
  })
  return normalized
}
