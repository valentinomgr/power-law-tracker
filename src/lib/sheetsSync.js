const SETTINGS_KEY = 'plt.sheets.v1'

export function loadSheetsConfig() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { url: '', connected: false, lastSync: null }
    return { url: '', connected: false, lastSync: null, ...JSON.parse(raw) }
  } catch {
    return { url: '', connected: false, lastSync: null }
  }
}

export function saveSheetsConfig(config) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}

function isLikelyAppsScriptUrl(url) {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url.trim())
}

export async function testConnection(url) {
  if (!isLikelyAppsScriptUrl(url)) {
    throw new Error(
      'That doesn\'t look like a Google Apps Script Web App URL. It should look like https://script.google.com/macros/s/.../exec'
    )
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'ping' }),
  })
  if (!res.ok) {
    throw new Error(`Sheet responded with an error (${res.status}). Double-check the deployment is set to "Anyone" access.`)
  }
  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.error || 'Connection test failed.')
  }
  return data
}

export async function syncPosts(url, posts) {
  if (!isLikelyAppsScriptUrl(url)) {
    throw new Error('Invalid Google Sheets connector URL.')
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'sync', posts }),
  })
  if (!res.ok) {
    throw new Error(`Sync failed (${res.status}).`)
  }
  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.error || 'Sync failed.')
  }
  return data
}
