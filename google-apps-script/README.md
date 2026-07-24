# Google Sheets backup connector

This lets Power Law Tracker back up your posts to a Google Sheet you own. Your data stays yours — this script only runs inside your own Google account, on your own sheet. Nothing goes through any third-party server.

## Setup (about 2 minutes, one time)

1. Open a Google Sheet — new or existing, whichever you want your backups to land in.
2. Go to **Extensions → Apps Script**.
3. Delete whatever's in the editor, and paste in the entire contents of [`Code.gs`](./Code.gs) from this folder.
4. Click **Deploy → New deployment**.
5. Click the gear icon next to "Select type" and choose **Web app**.
6. Set **Execute as: Me**, and **Who has access: Anyone**.
   - "Anyone" here just means anyone who has your exact, unguessable deployment URL can send data to it — it does not make your sheet public, and nobody can read your sheet through this link. Only Power Law Tracker (running in your browser) will ever use it, because only you will have the URL.
7. Click **Deploy**. Google will ask you to authorize the script — this is expected, since it's your own script running on your own sheet.
8. Copy the **Web app URL** it gives you (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).
9. In Power Law Tracker, open **Backup → Google Sheets backup**, paste the URL, and click **Connect**.

That's it. From then on, the app backs up your full post list to a "Posts" tab in that sheet a couple seconds after any change, and you can also trigger a sync manually with the "Sync now" button.

## What gets written

A single tab named `Posts`, with one row per post: id, date, label, all nine LinkedIn metrics, and your note. Every sync replaces the tab's contents with your current full list — it's a mirror, not an append-only log.

## Disconnecting

Click **Disconnect** in the app's Backup panel any time — this only clears the URL from the app's settings. It doesn't touch the sheet or revoke the script. To fully remove it, delete the Apps Script deployment from the sheet's Extensions menu.
