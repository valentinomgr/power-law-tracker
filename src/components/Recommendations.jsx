import './Recommendations.css'

export function buildRecommendations({ cycles, currentSummary, cycleSize, currentCount }) {
  const recs = []
  const completedCycles = cycles.filter((c) => c.length >= cycleSize)

  if (currentCount === 0) {
    recs.push({
      tone: 'neutral',
      text: 'Log your last few posts to get a real read. One data point tells you nothing — that\'s the whole point.',
    })
    return recs
  }

  if (currentCount < 3) {
    recs.push({
      tone: 'warn',
      text: 'Too early to conclude anything. Keep logging — patterns need at least a handful of posts before they mean something.',
    })
  }

  if (currentSummary.count >= 3 && currentSummary.hits.size === 0) {
    recs.push({
      tone: 'neutral',
      text: 'No standout post yet this cycle. That happens — most cycles have quiet stretches before something breaks out.',
    })
  }

  if (currentSummary.hits.size >= 1 && currentSummary.hitShare > 0.4) {
    recs.push({
      tone: 'good',
      text: `One post is carrying a big share of this cycle's results (${Math.round(currentSummary.hitShare * 100)}%). That's normal for this game — look at what made it different, but don't panic about the others.`,
    })
  }

  if (completedCycles.length >= 2) {
    recs.push({
      tone: 'good',
      text: `You've completed ${completedCycles.length} cycles. This is enough to stop judging yourself post-by-post and start looking at the cycle-level trend instead.`,
    })
  }

  if (completedCycles.length === 0 && currentCount >= cycleSize * 0.5) {
    recs.push({
      tone: 'neutral',
      text: `You're over halfway through your first cycle. Resist the urge to change your whole approach before it closes — let the full cycle finish first.`,
    })
  }

  if (currentSummary.giniLike > 0.5 && currentSummary.count >= 4) {
    recs.push({
      tone: 'good',
      text: 'This cycle looks skewed the way a power law should — a few posts pulling most of the weight. That\'s a sign you\'re in the right kind of game, not a sign something is wrong.',
    })
  } else if (currentSummary.giniLike > 0 && currentSummary.giniLike < 0.2 && currentSummary.count >= 5) {
    recs.push({
      tone: 'neutral',
      text: 'Results this cycle are unusually even — no post standing out much. Worth trying a more distinct angle or hook to create more variance.',
    })
  }

  if (recs.length === 0) {
    recs.push({
      tone: 'neutral',
      text: 'Keep logging. The picture gets clearer with more posts.',
    })
  }

  return recs
}

export default function Recommendations({ recommendations }) {
  return (
    <div className="recs">
      {recommendations.map((r, i) => (
        <div className={`recs__item recs__item--${r.tone}`} key={i}>
          {r.text}
        </div>
      ))}
    </div>
  )
}
