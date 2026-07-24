/**
 * Power Law Tracker — Google Sheets backup connector
 *
 * What this does: receives your posts from the Power Law Tracker app and
 * writes them into this spreadsheet. Nothing more. It does not read from
 * anywhere else, does not talk to any server but this sheet, and only runs
 * when the app sends data to the Web App URL you'll get after deploying.
 *
 * SETUP (one time, ~2 minutes):
 * 1. Open a Google Sheet (new or existing) — this is where your backups go.
 * 2. Extensions -> Apps Script.
 * 3. Delete anything in the editor, paste this whole file in.
 * 4. Click Deploy -> New deployment.
 * 5. Click the gear icon next to "Select type" -> Web app.
 * 6. Execute as: Me. Who has access: Anyone.
 *    ("Anyone" here just means anyone with the exact secret URL can POST to
 *    it — nobody can guess it, and nobody can read your sheet through it.)
 * 7. Click Deploy, authorize when asked (it's your own script, on your own
 *    sheet — the authorization prompt is expected and safe).
 * 8. Copy the Web App URL it gives you.
 * 9. Paste that URL into Power Law Tracker -> Settings -> Google Sheets backup.
 *
 * That's it. Every time you add/edit/delete a post in the app, it'll push
 * the full current list here, replacing the "Posts" tab's contents.
 */

const SHEET_NAME = 'Posts'

const COLUMNS = [
  'id', 'date', 'label',
  'impressions', 'membersReached', 'profileViews', 'followersGained',
  'reactions', 'comments', 'reposts', 'saves', 'sends',
  'note',
]

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    if (body.action === 'ping') {
      return jsonResponse({ ok: true, message: 'Connected.' })
    }
    if (body.action === 'sync' && Array.isArray(body.posts)) {
      writePosts(body.posts)
      return jsonResponse({ ok: true, count: body.posts.length })
    }
    return jsonResponse({ ok: false, error: 'Unknown action.' })
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) })
  }
}

function doGet() {
  // Lets you sanity-check the deployment URL by opening it in a browser.
  return jsonResponse({ ok: true, message: 'Power Law Tracker connector is live.' })
}

function writePosts(posts) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
  }
  sheet.clearContents()
  sheet.appendRow(COLUMNS)

  const rows = posts.map((p) => COLUMNS.map((c) => (p[c] !== undefined && p[c] !== null ? p[c] : '')))
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows)
  }
  sheet.autoResizeColumns(1, COLUMNS.length)
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
