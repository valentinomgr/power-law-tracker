const KEY = 'plt.posts.v1'
const SETTINGS_KEY = 'plt.settings.v1'

export function loadPosts() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function savePosts(posts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(posts))
  } catch {
    // storage unavailable (private mode, quota) — fail silently, app still works in-memory
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { cycleSize: 12 }
    return { cycleSize: 12, ...JSON.parse(raw) }
  } catch {
    return { cycleSize: 12 }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}
