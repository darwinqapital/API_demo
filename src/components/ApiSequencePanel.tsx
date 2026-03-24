import { useEffect, useRef, useState } from 'react'
import type { ApiLogEntry } from '../types/wedbush'

interface Props {
  entries: ApiLogEntry[]
}

export function ApiSequencePanel({ entries }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [entries.length])

  return (
    <aside className="api-panel" aria-label="API call sequence">
      <div className="api-panel__header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        API Sequence
        {entries.length > 0 && (
          <span className="api-panel__count">
            {String(entries.length)} call{entries.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {entries.length === 0 ? (
        <div className="api-panel__empty">
          Interact with the app to see API calls appear here
        </div>
      ) : (
        <div className="api-panel__list" ref={listRef} role="log" aria-live="polite">
          {entries.map((entry) => (
            <ApiCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </aside>
  )
}

function ApiCard({ entry }: { entry: ApiLogEntry }) {
  const [open, setOpen] = useState(false)

  const methodClass =
    entry.method === 'GET'
      ? 'api-card__method api-card__method--get'
      : entry.method === 'PATCH'
        ? 'api-card__method api-card__method--patch'
        : 'api-card__method'
  const statusClass =
    entry.statusCode < 300
      ? 'api-card__status api-card__status--2xx'
      : 'api-card__status api-card__status--4xx'

  return (
    <div className="api-card">
      <button
        className="api-card__header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        type="button"
      >
        <span className={methodClass}>{entry.method}</span>
        <span className="api-card__path" title={entry.path}>{entry.path}</span>
        <span className={statusClass}>{entry.statusCode}</span>
        <span className="api-card__duration">{entry.durationMs}ms</span>
        <svg
          className={`api-card__chevron${open ? ' api-card__chevron--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <div className={`api-card__body-wrapper${open ? ' api-card__body-wrapper--open' : ''}`}>
        <div className="api-card__body-inner">
          <div className="api-card__body">
            <div className="api-card__section-label">{entry.description}</div>
            {entry.requestBody != null && (
              <>
                <div className="api-card__section-label">Request</div>
                <pre className="api-card__json">{JSON.stringify(entry.requestBody, null, 2)}</pre>
              </>
            )}
            <div className="api-card__section-label">Response</div>
            <pre className="api-card__json">{JSON.stringify(entry.responseBody, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
