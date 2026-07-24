// A post's "score" is what we rank/distribute on. Weighted so higher-intent
// signals (comments, reposts, saves, sends, profile/follower actions) count
// for more than passive impressions. Mirrors LinkedIn's own analytics fields.
export function scorePost(post) {
  const impressions = Number(post.impressions) || 0
  const membersReached = Number(post.membersReached) || 0
  const reactions = Number(post.reactions) || 0
  const comments = Number(post.comments) || 0
  const reposts = Number(post.reposts) || 0
  const saves = Number(post.saves) || 0
  const sends = Number(post.sends) || 0
  const profileViews = Number(post.profileViews) || 0
  const followersGained = Number(post.followersGained) || 0

  return (
    impressions +
    membersReached * 0.5 +
    reactions * 3 +
    comments * 12 +
    reposts * 15 +
    saves * 15 +
    sends * 15 +
    profileViews * 10 +
    followersGained * 40
  )
}

export function chunkIntoCycles(posts, cycleSize) {
  const sorted = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date))
  const cycles = []
  for (let i = 0; i < sorted.length; i += cycleSize) {
    cycles.push(sorted.slice(i, i + cycleSize))
  }
  return cycles
}

// Classic outlier heuristic adapted for skewed distributions: a post counts
// as a "hit" if its score is at least 4x the cycle median, or it's the max
// and at least 2x the mean — catches early cycles too small for medians to mean much.
export function findHits(posts) {
  if (posts.length === 0) return new Set()
  const scores = posts.map(scorePost)
  const sortedScores = [...scores].sort((a, b) => a - b)
  const median = sortedScores[Math.floor(sortedScores.length / 2)] || 0
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const max = Math.max(...scores)

  const hits = new Set()
  posts.forEach((p, i) => {
    const s = scores[i]
    const isHit =
      (median > 0 && s >= median * 4) ||
      (s === max && mean > 0 && s >= mean * 2 && posts.length >= 3)
    if (isHit) hits.add(p.id)
  })
  return hits
}

export function summarize(posts) {
  if (posts.length === 0) {
    return {
      count: 0,
      totalScore: 0,
      meanScore: 0,
      medianScore: 0,
      maxScore: 0,
      hitShare: 0,
      hits: new Set(),
      giniLike: 0,
    }
  }
  const scores = posts.map(scorePost)
  const sorted = [...scores].sort((a, b) => a - b)
  const total = scores.reduce((a, b) => a + b, 0)
  const mean = total / scores.length
  const median = sorted[Math.floor(sorted.length / 2)] || 0
  const max = Math.max(...scores)
  const hits = findHits(posts)
  const hitScoreSum = posts.reduce((sum, p, i) => (hits.has(p.id) ? sum + scores[i] : sum), 0)
  const hitShare = total > 0 ? hitScoreSum / total : 0

  // Simple concentration measure (0 = perfectly even, 1 = one post has everything)
  // Approximated via a lightweight Gini-style calc, fine at small n.
  let giniSum = 0
  for (let i = 0; i < sorted.length; i++) {
    for (let j = 0; j < sorted.length; j++) {
      giniSum += Math.abs(sorted[i] - sorted[j])
    }
  }
  const giniLike = total > 0 ? giniSum / (2 * sorted.length * total) : 0

  return {
    count: posts.length,
    totalScore: total,
    meanScore: mean,
    medianScore: median,
    maxScore: max,
    hitShare,
    hits,
    giniLike,
  }
}

export function readinessLabel(cycleCount) {
  if (cycleCount === 0) return { label: 'No cycles yet', tone: 'neutral' }
  if (cycleCount === 1) return { label: 'Too early to read anything', tone: 'warn' }
  if (cycleCount < 3) return { label: 'Pattern still forming — keep going', tone: 'warn' }
  if (cycleCount < 6) return { label: 'A real pattern is visible now', tone: 'good' }
  return { label: 'Enough data to trust the shape', tone: 'good' }
}
