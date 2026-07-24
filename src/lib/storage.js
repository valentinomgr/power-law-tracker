// IndexedDB is used for posts because it's meaningfully more durable than
// localStorage: browser "clear cache" actions and storage-cleanup extensions
// frequently wipe localStorage but leave IndexedDB alone (it's treated as
// "site data", the same bucket as things like offline app data). It also has
// a much higher storage ceiling, though that's not the reason we're here —
// durability is.
//
// Settings (cycle size, Sheets config) stay in localStorage since they're
// low-stakes and synchronous access there is convenient.

const DB_NAME = 'power-law-tracker'
const DB_VERSION = 1
const STORE_NAME = 'posts'
const LOCALSTORAGE_FALLBACK_KEY = 'plt.posts.v1' // old key, also used as fallback + migration source

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

async function idbGetAll() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

async function idbPutAll(posts) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    posts.forEach((p) => store.put(p))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function loadLegacyLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_FALLBACK_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// One-time migration: if IndexedDB is empty but the old localStorage key has
// data (from before this change), copy it over so nobody loses posts on update.
async function migrateIfNeeded() {
  try {
    const existing = await idbGetAll()
    if (existing.length > 0) return existing
    const legacy = loadLegacyLocalStorage()
    if (legacy.length > 0) {
      await idbPutAll(legacy)
      return legacy
    }
    return []
  } catch {
    return loadLegacyLocalStorage()
  }
}

export async function loadPosts() {
  try {
    return await migrateIfNeeded()
  } catch {
    return loadLegacyLocalStorage()
  }
}

export async function savePosts(posts) {
  try {
    await idbPutAll(posts)
    // Keep a lightweight mirror in localStorage too — belt and suspenders.
    // If IndexedDB is ever unavailable (some private-browsing modes), this
    // mirror is what loadPosts() falls back to.
    try {
      localStorage.setItem(LOCALSTORAGE_FALLBACK_KEY, JSON.stringify(posts))
    } catch {
      // ignore — IndexedDB write already succeeded, which is what matters
    }
  } catch {
    try {
      localStorage.setItem(LOCALSTORAGE_FALLBACK_KEY, JSON.stringify(posts))
    } catch {
      // both storage layers unavailable — data will only live in memory this session
    }
  }
}

const SETTINGS_KEY = 'plt.settings.v1'

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { cycleSize: 12, lastBackupAt: null }
    return { cycleSize: 12, lastBackupAt: null, ...JSON.parse(raw) }
  } catch {
    return { cycleSize: 12, lastBackupAt: null }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}
