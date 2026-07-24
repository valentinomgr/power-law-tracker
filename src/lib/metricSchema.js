// Single source of truth for post metrics. Field keys and labels mirror
// LinkedIn's own analytics UI and .xlsx export, so what you type here matches
// what you see on LinkedIn — no mental translation required.

export const METRIC_GROUPS = [
  {
    group: 'Discovery',
    fields: [
      { key: 'impressions', label: 'Impressions', help: 'Total times the post was shown' },
      { key: 'membersReached', label: 'Members reached', help: 'Unique people who saw it' },
    ],
  },
  {
    group: 'Profile activity',
    fields: [
      { key: 'profileViews', label: 'Profile viewers from this post', help: '' },
      { key: 'followersGained', label: 'Followers gained from this post', help: '' },
    ],
  },
  {
    group: 'Engagement',
    fields: [
      { key: 'reactions', label: 'Reactions', help: 'Likes, celebrates, etc.' },
      { key: 'comments', label: 'Comments', help: '' },
      { key: 'reposts', label: 'Reposts', help: '' },
      { key: 'saves', label: 'Saves', help: '' },
      { key: 'sends', label: 'Sends on LinkedIn', help: '' },
    ],
  },
]

export const METRIC_FIELDS = METRIC_GROUPS.flatMap((g) => g.fields)
export const METRIC_KEYS = METRIC_FIELDS.map((f) => f.key)

export function emptyMetrics() {
  return Object.fromEntries(METRIC_KEYS.map((k) => [k, 0]))
}
