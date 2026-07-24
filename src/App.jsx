import { useEffect, useMemo, useState, useRef } from 'react'
import { loadPosts, savePosts, loadSettings, saveSettings } from './lib/storage'
import { chunkIntoCycles, summarize, readinessLabel } from './lib/stats'
import { exportCSV, exportJSON, importJSON } from './lib/exportData'
import { METRIC_KEYS } from './lib/metricSchema'
import { loadSheetsConfig, saveSheetsConfig, syncPosts } from './lib/sheetsSync'
import DistributionStrip from './components/DistributionStrip'
import PostForm from './components/PostForm'
import CycleSummary from './components/CycleSummary'
import Recommendations, { buildRecommendations } from './components/Recommendations'
import PostList from './components/PostList'
import CycleHistory from './components/CycleHistory'
import SheetsBackup from './components/SheetsBackup'
import './App.css'

export default function App() {
  const [posts, setPosts] = useState([])
  const [postsLoaded, setPostsLoaded] = useState(false)
  const [settings, setSettings] = useState(() => loadSettings())
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [sheetsConfig, setSheetsConfig] = useState(() => loadSheetsConfig())
  const [syncing, setSyncing] = useState(false)
  const syncTimer = useRef(null)
  const importInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    loadPosts().then((loaded) => {
      if (!cancelled) {
        setPosts(loaded)
        setPostsLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // Don't write back to storage until the initial load has completed —
    // otherwise the empty initial state would overwrite real data on mount.
    if (!postsLoaded) return
    savePosts(posts)
  }, [posts, postsLoaded])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    saveSheetsConfig(sheetsConfig)
  }, [sheetsConfig])

  // Auto-backup to Google Sheets a couple seconds after posts change, so
  // rapid edits (add, then immediately delete) don't fire a sync per keystroke.
  useEffect(() => {
    if (!postsLoaded) return
    if (!sheetsConfig.connected || !sheetsConfig.url) return
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      runSync()
    }, 2500)
    return () => clearTimeout(syncTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, postsLoaded, sheetsConfig.connected, sheetsConfig.url])

  async function runSync() {
    if (!sheetsConfig.url) return
    setSyncing(true)
    try {
      await syncPosts(sheetsConfig.url, posts)
      setSheetsConfig((c) => ({ ...c, connected: true, lastSync: new Date().toISOString() }))
    } catch {
      // Silent on auto-sync — the manual "Sync now" button surfaces errors directly.
    } finally {
      setSyncing(false)
    }
  }

  const cycles = useMemo(() => chunkIntoCycles(posts, settings.cycleSize), [posts, settings.cycleSize])
  const currentCycle = useMemo(() => (cycles.length > 0 ? cycles[cycles.length - 1] : []), [cycles])
  const currentSummary = useMemo(() => summarize(currentCycle), [currentCycle])
  const readiness = readinessLabel(cycles.length)
  const recommendations = useMemo(
    () =>
      buildRecommendations({
        cycles,
        currentSummary,
        cycleSize: settings.cycleSize,
        currentCount: currentCycle.length,
      }),
    [cycles, currentSummary, settings.cycleSize, currentCycle.length]
  )

  function handleAdd(post, duplicateOf) {
    if (duplicateOf) {
      const confirmed = window.confirm(
        `Update "${duplicateOf.label}" with today's numbers? The previous reading (${duplicateOf.impressions ?? 0} impressions on ${new Date(duplicateOf.measuredAt || duplicateOf.date).toLocaleDateString()}) will be kept in its history, not lost.`
      )
      if (!confirmed) return

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== duplicateOf.id) return p
          const priorSnapshot = {
            measuredAt: p.measuredAt || p.date,
            ...Object.fromEntries(METRIC_KEYS.map((k) => [k, p[k] ?? 0])),
          }
          const history = [...(p.snapshots || []), priorSnapshot]
          return { ...p, ...post, id: p.id, snapshots: history }
        })
      )
      return
    }
    setPosts((prev) => [...prev, { ...post, snapshots: [] }])
  }

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  function handleEditPost(updated) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
  }

  function handleClearAll() {
    if (posts.length === 0) return
    const ok = window.confirm('Delete all logged posts? This cannot be undone.')
    if (ok) setPosts([])
  }

  async function handleImportFile(file) {
    try {
      const imported = await importJSON(file)
      const existingIds = new Set(posts.map((p) => p.id))
      const newOnes = imported.filter((p) => !existingIds.has(p.id))
      const skipped = imported.length - newOnes.length

      if (newOnes.length === 0) {
        window.alert(skipped > 0 ? 'Every post in that file is already in your list — nothing new to add.' : 'That file had no posts in it.')
        return
      }

      const proceed = window.confirm(
        `Found ${imported.length} post(s) in that file` +
          (skipped > 0 ? `, ${skipped} already in your list` : '') +
          `. Add the ${newOnes.length} new one(s)?`
      )
      if (proceed) {
        setPosts((prev) => [...prev, ...newOnes])
        setSettings((s) => ({ ...s, lastBackupAt: new Date().toISOString() }))
      }
    } catch (err) {
      window.alert(err.message || 'Could not import that file.')
    }
  }

  function handleCycleSizeChange(e) {
    const val = Math.max(3, Math.min(50, Number(e.target.value) || 12))
    setSettings((s) => ({ ...s, cycleSize: val }))
  }

  function handleExportBackup() {
    exportJSON(posts)
    setSettings((s) => ({ ...s, lastBackupAt: new Date().toISOString() }))
    setShowExportMenu(false)
  }

  const daysSinceBackup = settings.lastBackupAt
    ? Math.floor((Date.now() - new Date(settings.lastBackupAt).getTime()) / 86400000)
    : null
  const showBackupReminder = postsLoaded && posts.length >= 5 && (daysSinceBackup === null || daysSinceBackup >= 7)

  return (
    <div className="app">
      <header className="app__hero">
        <div className="app__hero-inner">
          <p className="app__eyebrow">A free tool for people who post and wonder why it isn't working</p>
          <h1 className="app__title">
            Stop judging <em>one</em> post.
            <br />
            Start reading the <em>shape</em>.
          </h1>
          <p className="app__subtitle">
            Most posts get almost nothing back. Then, once in a while, one carries the rest. That's not
            failure — that's the pattern this tool is built to show you.
          </p>
        </div>
      </header>

      <main className="app__main">
        <section className="app__section">
          <div className="app__section-head">
            <h2>Current cycle</h2>
            <span className="app__cycle-size-control">
              Cycle size
              <input
                type="number"
                min="3"
                max="50"
                value={settings.cycleSize}
                onChange={handleCycleSizeChange}
              />
              posts
            </span>
          </div>

          <DistributionStrip
            posts={currentCycle}
            hits={currentSummary.hits}
            emptyHint="Log a post below to start your first cycle."
          />

          <CycleSummary
            summary={currentSummary}
            cycleSize={settings.cycleSize}
            currentCount={currentCycle.length}
            readiness={readiness}
          />
        </section>

        {showBackupReminder && (
          <div className="app__reminder">
            <span>
              {daysSinceBackup === null
                ? "You haven't backed up yet. Your posts live in this browser only — a quick export keeps them safe."
                : `It's been ${daysSinceBackup} days since your last backup.`}
            </span>
            <button onClick={handleExportBackup}>Back up now</button>
          </div>
        )}

        <section className="app__section">
          <h2>Backup &amp; restore</h2>
          <p className="app__section-hint">
            Your data lives in this browser. Export a backup file now and then, and you can restore it here or
            on another device.
          </p>
          <div className="app__backup-row">
            <button className="app__ghost-btn" onClick={handleExportBackup}>
              Export backup (.json)
            </button>
            <button className="app__ghost-btn" onClick={() => importInputRef.current?.click()}>
              Import backup (.json)
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImportFile(file)
                e.target.value = ''
              }}
            />
          </div>

          <details className="app__advanced">
            <summary>Advanced: back up to your own Google Sheet</summary>
            <SheetsBackup
              config={sheetsConfig}
              onSave={setSheetsConfig}
              onManualSync={runSync}
              syncing={syncing}
            />
          </details>
        </section>

        <section className="app__section">
          <PostForm onAdd={handleAdd} existingPosts={posts} />
        </section>

        {recommendations.length > 0 && (
          <section className="app__section">
            <h2>What this tells you</h2>
            <Recommendations recommendations={recommendations} />
          </section>
        )}

        {currentCycle.length > 0 && (
          <section className="app__section">
            <div className="app__section-head">
              <h2>This cycle's posts</h2>
              <div className="app__toolbar">
                <div className="app__export-wrap">
                  <button className="app__ghost-btn" onClick={() => setShowExportMenu((v) => !v)}>
                    Export
                  </button>
                  {showExportMenu && (
                    <div className="app__export-menu">
                      <button onClick={() => { exportCSV(posts); setShowExportMenu(false) }}>
                        Download CSV
                      </button>
                      <button onClick={() => { exportJSON(posts); setSettings((s) => ({ ...s, lastBackupAt: new Date().toISOString() })); setShowExportMenu(false) }}>
                        Download JSON
                      </button>
                    </div>
                  )}
                </div>
                <button className="app__ghost-btn app__ghost-btn--danger" onClick={handleClearAll}>
                  Clear all
                </button>
              </div>
            </div>
            <PostList posts={currentCycle} hits={currentSummary.hits} onDelete={handleDelete} onEdit={handleEditPost} />
          </section>
        )}

        {cycles.length > 1 && (
          <section className="app__section">
            <CycleHistory cycles={cycles} cycleSize={settings.cycleSize} />
          </section>
        )}
      </main>

      <footer className="app__footer">
        <p>
          Your data stays in this browser — nothing is sent anywhere. Built as a free tool, open source on{' '}
          <a href="https://github.com/valentinomgr/power-law-tracker" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
