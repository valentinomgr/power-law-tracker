# Power Law Tracker

Stop judging yourself post by post. Track your content in cycles and see the real distribution.

**[Live demo →](https://valentinomgr.github.io/power-law-tracker/)** · **[Full usage guide →](./USAGE.md)**

## Why this exists

Most content, client outreach, and business results don't follow a normal distribution — they follow a power law. Most attempts get almost nothing back. Then, once in a while, one carries the rest. That's not a sign you're doing something wrong; it's the expected shape of the game.

The problem is that most people judge each post, pitch, or attempt in isolation — "this one flopped, I must be bad at this" — instead of looking at the pattern across a full cycle of attempts.

Power Law Tracker fixes that. Log your posts, group them into cycles, and see the actual shape of your results — including which post is quietly carrying the whole cycle.

## Features

- **Log posts manually, or import directly from LinkedIn** — one click imports a post's `.xlsx` analytics export (Impressions, Members reached, Reactions, Comments, Reposts, Saves, Sends, Profile views, Followers gained) instead of typing nine numbers by hand
- **Re-measuring a post doesn't create a duplicate** — re-importing the same post later (e.g. a week vs. a month after posting) is detected by post URL and merged as a new snapshot, with the earlier reading kept in history
- **Cycle-based grouping** — define a cycle size (default 12 posts) and see stats per cycle, not per post
- **Distribution visualization** — a signature "skyline" strip showing every post's relative performance, with outlier posts highlighted
- **Outlier detection** — automatically flags posts that are meaningfully carrying a cycle's results
- **Data-driven recommendations** — plain-language guidance based on how many cycles you've completed and how skewed your results are
- **Cycle history** — compare past completed cycles side by side
- **Backup & restore** — export/import a JSON backup any time, with a reminder if it's been a while; optional advanced sync to your own Google Sheet
- **Local-first storage** — your data lives in this browser (IndexedDB). Nothing is sent to any server unless you opt into the Google Sheets backup, and even then it goes straight to a sheet you own.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Building for production

```bash
npm run build
```

Output is written to `dist/`. This is a static site — deploy it anywhere that serves static files (GitHub Pages, Vercel, Netlify, Cloudflare Pages, etc.).

### Deploying to GitHub Pages

```bash
npm run build
# push the contents of dist/ to a gh-pages branch, or use an action like
# peaceiris/actions-gh-pages in your CI workflow
```

## Tech stack

- React 19 + Vite
- No backend, no database of ours — data lives in IndexedDB (with a localStorage fallback) in your browser; the optional Google Sheets backup talks directly to a sheet you own
- No external analytics or tracking

## How scoring works

Each post gets a weighted score across all nine LinkedIn metrics, with higher-intent signals counted for more than passive ones — comments, reposts, saves, and sends outweigh raw impressions, and profile views / followers gained (a post converting a stranger into a follower) outweigh both. A post is flagged as an outlier when it scores well above the cycle's median or mean — the mechanism a power law relies on. See [`src/lib/stats.js`](./src/lib/stats.js) for the exact weights.

This is a simple heuristic, not a rigorous statistical model. The point is to give you a fast, intuitive read — not a research-grade analysis.

## Contributing

Have an idea, found a bug, or want something added? Open an **[Issue](https://github.com/valentinomgr/power-law-tracker/issues/new)** — that's just a message posted on the repo's Issues tab describing what you'd like to see. No code needed. Click the link, describe the idea in a few sentences, and submit. That's the whole process.

If you know how to code and want to make the change yourself, you can open a **Pull Request** (a PR) instead — fork the repo, make your change, and submit it for review. Either path works; Issues are for "here's an idea," PRs are for "here's the idea, already built."

This is meant to stay small and free. Ideas that would fit well: auto-import from platform APIs, more scoring models, team accounts.

## License

MIT — see [LICENSE](./LICENSE).
