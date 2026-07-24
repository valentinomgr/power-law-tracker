import { useEffect, useMemo, useState } from 'react'
import { loadPosts, savePosts, loadSettings, saveSettings } from './lib/storage'
import { chunkIntoCycles, summarize, readinessLabel } from './lib/stats'
import { exportCSV, exportJSON } from './lib/exportData'
import DistributionStrip from './components/DistributionStrip'
import PostForm from './components/PostForm'
import CycleSummary from './components/CycleSummary'
import Recommendations, { buildRecommendations } from './components/Recommendations'
import PostList from './components/PostList'
import CycleHistory from './components/CycleHistory'
import './App.css'

export default function App() {
  const [posts, setPosts] = useState(() => loadPosts())
  const [settings, setSettings] = useState(() => loadSettings())
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    savePosts(posts)
  }, [posts])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

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

  function handleAdd(post) {
    setPosts((prev) => [...prev, post])
  }

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  function handleClearAll() {
    if (posts.length === 0) return
    const ok = window.confirm('Delete all logged posts? This cannot be undone.')
    if (ok) setPosts([])
  }

  function handleCycleSizeChange(e) {
    const val = Math.max(3, Math.min(50, Number(e.target.value) || 12))
    setSettings((s) => ({ ...s, cycleSize: val }))
  }

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

        <section className="app__section">
          <PostForm onAdd={handleAdd} />
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
                      <button onClick={() => { exportJSON(posts); setShowExportMenu(false) }}>
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
            <PostList posts={currentCycle} hits={currentSummary.hits} onDelete={handleDelete} />
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
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
