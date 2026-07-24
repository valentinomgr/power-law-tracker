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
  const headers = ['date', 'label', 'views', 'likes', 'comments', 'shares', 'note']
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
