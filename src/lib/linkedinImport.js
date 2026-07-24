// SheetJS is loaded lazily so the ~500kb parser isn't in the main bundle —
// most people never click "Import", they just log posts manually.
async function loadXLSX() {
  const mod = await import('xlsx')
  return mod
}

// LinkedIn's "Post analytics" export is a single sheet, key-value pairs in
// columns A/B for the summary block, then a "Post viewer demographics" table
// further down (which we ignore — not useful for cycle tracking).
//
// Row labels (column A) are stable across exports; we match on them rather
// than fixed row numbers, since LinkedIn has changed row spacing before.
const LABEL_TO_FIELD = {
  'Impressions': 'impressions',
  'Members reached': 'membersReached',
  'Profile viewers from this post': 'profileViews',
  'Followers gained from this post': 'followersGained',
  'Reactions': 'reactions',
  'Comments': 'comments',
  'Reposts': 'reposts',
  'Saves': 'saves',
  'Sends on LinkedIn': 'sends',
}

function excelSerialToISODate(value) {
  // LinkedIn exports "Post Date" as a date-like string (e.g. "7/24/2026"), not
  // always an Excel serial. Handle both.
  //
  // IMPORTANT: never route this through `new Date(string).toISOString()`.
  // `new Date("7/24/2026")` is parsed as *local* midnight, but toISOString()
  // converts to UTC — so in any timezone ahead of UTC (e.g. Kyiv, UTC+2/+3),
  // that rolls back to the previous day. We parse components manually and
  // build the ISO string ourselves, with no timezone conversion involved.
  if (typeof value === 'number') {
    // Excel serial date -> calendar date (Excel's epoch is 1899-12-30).
    // Compute the date in UTC terms, since the serial number itself has no
    // timezone — it's just a day count.
    const utcDays = Math.floor(value - 25569)
    const d = new Date(utcDays * 86400 * 1000)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  if (typeof value === 'string') {
    // Expect "M/D/YYYY" (LinkedIn's format). Parse the three components
    // directly rather than handing the string to the Date constructor.
    const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (match) {
      const [, month, day, year] = match
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    // Fallback for unexpected formats — best effort, may be off by a day
    // in some timezones, but better than returning nothing.
    const d = new Date(value)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  return null
}

export async function parseLinkedInXlsx(file) {
  const XLSX = await loadXLSX()
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  const sheetName = workbook.SheetNames.find((n) => /post analytics/i.test(n)) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error('Could not find a sheet in that file.')
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

  const metrics = {}
  let postUrl = null
  let date = null

  for (const row of rows) {
    const label = row[0]
    const value = row[1]
    if (typeof label !== 'string') continue

    if (label === 'Post URL' && value) {
      postUrl = String(value)
    }
    if (label === 'Post Date' && value) {
      date = excelSerialToISODate(value)
    }
    if (label in LABEL_TO_FIELD && value !== null && value !== undefined) {
      const num = Number(value)
      if (!Number.isNaN(num)) {
        metrics[LABEL_TO_FIELD[label]] = num
      }
    }
  }

  if (Object.keys(metrics).length === 0) {
    throw new Error(
      'No recognizable metrics found. Make sure this is the "Post analytics" export from LinkedIn (Export button on a post\'s analytics page).'
    )
  }

  return { postUrl, date, metrics }
}
