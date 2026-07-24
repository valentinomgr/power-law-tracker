import { useState } from 'react'
import { testConnection } from '../lib/sheetsSync'
import './SheetsBackup.css'

export default function SheetsBackup({ config, onSave, onManualSync, syncing }) {
  const [open, setOpen] = useState(false)
  const [urlInput, setUrlInput] = useState(config.url)
  const [testState, setTestState] = useState({ status: 'idle', message: '' })

  async function handleTest() {
    setTestState({ status: 'testing', message: '' })
    try {
      await testConnection(urlInput)
      setTestState({ status: 'success', message: 'Connected — ready to back up.' })
      onSave({ ...config, url: urlInput.trim(), connected: true })
    } catch (err) {
      setTestState({ status: 'error', message: err.message })
      onSave({ ...config, url: urlInput.trim(), connected: false })
    }
  }

  function handleDisconnect() {
    setUrlInput('')
    setTestState({ status: 'idle', message: '' })
    onSave({ url: '', connected: false, lastSync: null })
  }

  return (
    <div className="sheets">
      <button className="sheets__toggle" onClick={() => setOpen((v) => !v)}>
        <span className={`sheets__dot ${config.connected ? 'sheets__dot--on' : ''}`} />
        Google Sheets backup {config.connected ? '— connected' : '— not connected'}
      </button>

      {open && (
        <div className="sheets__panel">
          {!config.connected ? (
            <>
              <p className="sheets__hint">
                Back up your posts to your own Google Sheet. Your data still lives in this browser first —
                this just keeps a copy somewhere safer than local storage alone.
              </p>
              <ol className="sheets__steps">
                <li>
                  Open the{' '}
                  <a
                    href="https://github.com/valentinomgr/power-law-tracker/tree/main/google-apps-script"
                    target="_blank"
                    rel="noreferrer"
                  >
                    connector script
                  </a>{' '}
                  and follow the setup comment at the top (about 2 minutes, one time).
                </li>
                <li>Paste the Web App URL it gives you below.</li>
              </ol>
              <div className="sheets__input-row">
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button onClick={handleTest} disabled={!urlInput || testState.status === 'testing'}>
                  {testState.status === 'testing' ? 'Testing…' : 'Connect'}
                </button>
              </div>
              {testState.message && (
                <div className={`sheets__status sheets__status--${testState.status}`}>{testState.message}</div>
              )}
            </>
          ) : (
            <>
              <p className="sheets__hint">
                Connected. {config.lastSync ? `Last synced ${new Date(config.lastSync).toLocaleString()}.` : 'Not synced yet.'}
              </p>
              <div className="sheets__actions">
                <button onClick={onManualSync} disabled={syncing}>
                  {syncing ? 'Syncing…' : 'Sync now'}
                </button>
                <button className="sheets__disconnect" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </div>
              {testState.message && (
                <div className={`sheets__status sheets__status--${testState.status}`}>{testState.message}</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
