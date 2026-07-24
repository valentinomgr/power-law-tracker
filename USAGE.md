# Using Power Law Tracker

A step-by-step guide to every screen and feature, with examples.

---

## Contents

1. [The core idea, in one minute](#1-the-core-idea-in-one-minute)
2. [Logging a post manually](#2-logging-a-post-manually)
3. [Importing a post from LinkedIn's .xlsx export](#3-importing-a-post-from-linkedins-xlsx-export)
4. [Re-measuring the same post later](#4-re-measuring-the-same-post-later)
5. [Reading the current cycle](#5-reading-the-current-cycle)
6. [Understanding "What this tells you"](#6-understanding-what-this-tells-you)
7. [The post list](#7-the-post-list)
8. [Cycle history](#8-cycle-history)
9. [Backup & restore](#9-backup--restore)
10. [Advanced: Google Sheets backup](#10-advanced-google-sheets-backup)
11. [Changing cycle size](#11-changing-cycle-size)
12. [FAQ](#12-faq)

---

## 1. The core idea, in one minute

Most posts get almost nothing back. Every so often, one post carries the results of many others combined. That's not a sign you're doing something wrong — it's the normal shape of this kind of game.

The problem: most people judge each post on its own ("that one flopped, I must be bad at this") instead of looking at the pattern across many posts.

This tool fixes that by grouping your posts into **cycles** (a batch of posts, 12 by default) and showing you the *shape* of each cycle's results — not just one post in isolation.

---

## 2. Logging a post manually

1. Scroll to the **"+ Log a post"** button and click it.
2. Fill in:
   - **What was it** — a short name for yourself, e.g. `Power law hook post`
   - **Date** — when you published it
   - The metrics, grouped exactly as LinkedIn groups them:

     | Group | Fields |
     |---|---|
     | Discovery | Impressions, Members reached |
     | Profile activity | Profile viewers from this post, Followers gained from this post |
     | Engagement | Reactions, Comments, Reposts, Saves, Sends on LinkedIn |

   - **Note** (optional) — anything you noticed, e.g. `hook was weak` or `posted on a Sunday`
3. Click **Add post**.

**Where do these numbers come from?** Open your post on LinkedIn → click the analytics/impressions number under the post → the numbers shown there match every field in this form, labeled the same way.

---

## 3. Importing a post from LinkedIn's .xlsx export

Typing in seven numbers by hand gets old. LinkedIn lets you export a post's full analytics as an Excel file — this app can read that file directly.

### Getting the file from LinkedIn

1. Open your post's analytics view.
2. Click **Export** (top-right of the analytics panel).
3. LinkedIn downloads a file named something like `SinglePostAnalytics_Your_Name_1234567890.xlsx`.

### Importing it

1. Click **"Import from LinkedIn .xlsx"** (next to "+ Log a post").
2. Choose the file you just downloaded.
3. The form opens, pre-filled with:
   - **Date** — taken from the post's actual publish date
   - **What was it** — a readable name generated from the post's URL (e.g. a post about risk vs. consistency becomes *"Most advice about risk vs consistency"*)
   - All nine metrics
4. Check the numbers, adjust anything if needed, and click **Add post**.

> The app never talks to LinkedIn directly — you download the file yourself, and the import happens entirely inside your browser.

---

## 4. Re-measuring the same post later

A post's numbers a week after posting look very different from the same post a month later — 200 impressions can become 1,000. Re-importing the same post's `.xlsx` file later does **not** create a duplicate.

### How it works

1. Import a `.xlsx` file for a post you've already logged before (matched by the post's LinkedIn URL, captured automatically on first import).
2. The app shows a banner:

   > *This looks like the same post as "..." logged {date} with {N} impressions. Submitting will update it to a new snapshot with today's numbers and keep the earlier reading in its history — it won't count as a second post.*

3. The button changes to **"Update with new snapshot"**. Click it, then confirm the dialog that appears.
4. The post's numbers update to the new reading. The old reading isn't lost — it moves into that post's history.

### What you'll see afterward

In the post list, a post with more than one reading shows a small badge like **"2 readings"**, and its date line shows both:

```
Posted 2026-02-08 · measured 2026-03-08
```

Cycle stats and the distribution strip always use each post's **latest** reading, so a re-measured post is still counted exactly once — never twice.

---

## 5. Reading the current cycle

At the top of the app, **"Current cycle"** shows your most recent batch of posts (12 by default — see [Changing cycle size](#11-changing-cycle-size)).

### The distribution strip

A row of bars, one per post in the cycle. Height = how well that post did relative to the others in the cycle. Most bars will be short. If one post is meaningfully carrying the cycle, its bar turns **red** and is labeled an outlier.

This is the whole point of the tool, visualized: most posts small, one occasionally large.

### The four numbers underneath

| Stat | What it means |
|---|---|
| **Posts logged** | How many posts are in this cycle so far |
| **Top post share** | What % of the cycle's combined score comes from the single best post |
| **Median score** | The typical post's score — the middle value, not skewed by the outlier |
| **Best score** | The single highest-scoring post's score |

A status line below tells you how much to trust the picture yet — e.g. *"Too early to read anything"* with only 1 post, up to *"Enough data to trust the shape"* once you've completed several full cycles.

---

## 6. Understanding "What this tells you"

This section turns your numbers into plain-language guidance — the same read a coach would give you, generated fresh from your actual data. Examples of what you might see:

- *"Too early to conclude anything. Keep logging..."* — fewer than 3 posts so far
- *"No standout post yet this cycle. That happens..."* — no outlier detected
- *"One post is carrying a big share of this cycle's results (52%)..."* — an outlier was found and what to do about it
- *"You've completed 2 cycles. This is enough to stop judging yourself post-by-post..."* — once you have real cycle-over-cycle history

These update automatically every time you add or edit a post.

---

## 7. The post list

Below the form, **"This cycle's posts"** lists every post in your current cycle, most recent first. Each row shows:

- The post's name, with an **Outlier** badge if it's the cycle's standout, and a **readings** badge if it's been re-measured
- Posted date and (if different) last-measured date
- All nine metrics
- Profile views / followers gained, highlighted in the accent color when present
- Your note, if you added one
- A **×** button to delete that post

### Toolbar

- **Export** → download this cycle's posts as CSV or JSON
- **Clear all** → deletes every post (asks for confirmation first — this can't be undone)

---

## 8. Cycle history

Once you've completed more than one full cycle, a **"Past cycles"** section appears below, showing each finished cycle's distribution strip and summary stats side by side — most recent first. This is how you check whether the pattern repeats over time, rather than judging any single cycle in isolation.

---

## 9. Backup & restore

Your posts are stored in this browser (in IndexedDB, which is more resistant to being accidentally cleared than typical browser storage — but still local to this device and this browser).

### Exporting a backup

Click **"Export backup (.json)"** in the Backup & restore section. This downloads a JSON file with every post you've logged.

**Do this periodically** — especially before clearing your browser data, switching computers, or if you just want peace of mind. If you have 5 or more posts and haven't backed up in a week, a reminder banner appears automatically with a one-click **"Back up now"** button.

### Restoring from a backup

Click **"Import backup (.json)"** and choose a previously exported file. The app tells you how many posts it found and, for any already in your list (matched by internal ID), skips them — you'll only add what's actually new.

This is also how you move your data to a different browser or computer: export on the old one, import on the new one.

---

## 10. Advanced: Google Sheets backup

For an extra layer of durability, you can mirror your posts to a Google Sheet you own. This is optional — file backup (above) already protects you, this is a "belt and suspenders" option for people who want their data automatically synced somewhere outside the browser.

Open **"Advanced: back up to your own Google Sheet"** at the bottom of the Backup & restore section to set this up. Setup takes about 2 minutes and requires pasting a small script into a Google Sheet you own — full instructions are linked from that panel. No Google login inside this app, no account creation, no third-party server: the connection goes directly from your browser to your own sheet.

Once connected:
- Every change auto-syncs to your sheet a couple of seconds later
- A **"Sync now"** button is available for a manual push any time
- **Disconnect** at any time — this only removes the connection from the app; it doesn't touch your sheet

---

## 11. Changing cycle size

Next to "Current cycle," there's a **Cycle size** field (default: 12). Set it to whatever batch size makes sense for your posting rhythm — e.g. 10 for round numbers, or 20 if you post daily and want monthly-ish cycles.

Changing this re-groups all your existing posts into new cycles immediately — nothing is deleted, the grouping just recalculates.

---

## 12. FAQ

**Does this app see my LinkedIn account or post anything on my behalf?**
No. It never connects to LinkedIn. You export a file yourself and upload it here, or you type numbers in by hand.

**Where exactly is my data stored?**
In this browser, on this device, using IndexedDB (with a small localStorage mirror as a fallback). Nothing is sent to a server unless you explicitly set up the optional Google Sheets backup — and even then, it goes straight to a sheet you own, not through any server of ours.

**What happens if I clear my browser data?**
Your posts could be lost, which is exactly what the Backup & restore section exists to prevent. Export a backup periodically, and restore it if that happens.

**I imported the same post twice by accident without meaning to update it — what now?**
If you clicked "Update with new snapshot" and confirmed, the old reading is safely kept in that post's history, not deleted — you haven't lost anything.

**Can I edit a post's numbers after adding it?**
Yes — click **Edit** next to the delete button on any post. This opens the same fields you used to add it; save to update, or cancel to leave it as-is. Editing doesn't affect a post's snapshot history or its duplicate-detection link to its LinkedIn URL.

**What counts as an "outlier" post?**
A post scoring well above the cycle's median or mean, using a weighted score across all nine metrics (comments, reposts, saves, sends, and follower/profile actions count for more than passive impressions, since they're stronger signals of real resonance).
