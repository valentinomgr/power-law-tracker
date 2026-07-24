import { summarize } from '../lib/stats'
import DistributionStrip from './DistributionStrip'
import './CycleHistory.css'

export default function CycleHistory({ cycles, cycleSize }) {
  const completed = cycles.filter((c) => c.length >= cycleSize)

  if (completed.length === 0) return null

  // Show most recent completed cycles first
  const reversed = [...completed].reverse()

  return (
    <div className="chist">
      <h3 className="chist__title">Past cycles</h3>
      <div className="chist__list">
        {reversed.map((cycle, idx) => {
          const summary = summarize(cycle)
          const cycleNumber = completed.length - idx
          return (
            <div className="chist__cycle" key={idx}>
              <div className="chist__cycle-head">
                <span className="chist__cycle-number">Cycle {cycleNumber}</span>
                <span className="chist__cycle-stat">
                  {summary.count} posts · top post {Math.round(summary.hitShare * 100)}% of results
                </span>
              </div>
              <DistributionStrip posts={cycle} hits={summary.hits} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
