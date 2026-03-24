import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { StoryProgress } from './components/StoryProgress'
import { AppSurface } from './components/AppSurface'
import { ApiSequencePanel } from './components/ApiSequencePanel'
import { type AppState, type DemoStage, INITIAL_STATE, STAGES, type ApiLogEntry } from './types/wedbush'
import type { Action } from './sim/scenarioEngine'

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, currentStage: action.stage }
    case 'COMPLETE_STAGE':
      return {
        ...state,
        completedStages: state.completedStages.includes(action.stage)
          ? state.completedStages
          : [...state.completedStages, action.stage],
      }
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.value }
    case 'ADD_LOG':
      return { ...state, apiLog: [...state.apiLog, action.entry] }
    case 'SET_TOKEN':
      return { ...state, token: action.token }
    case 'SET_CLIENT_ID':
      return { ...state, clientId: action.id }
    case 'SET_ACCOUNT_IDS':
      return { ...state, accountIds: { ...state.accountIds, ...action.ids } }
    case 'SET_PAYMENT_ACCOUNT_ID':
      return { ...state, paymentAccountId: action.id }
    case 'SET_BALANCE':
      return { ...state, balance: action.balance }
    case 'SET_KYC_STATUS':
      return { ...state, kycStatus: action.status }
    case 'SET_SELECTED_ACCOUNT_TYPES':
      return { ...state, selectedAccountTypes: action.types }
    case 'SET_PERSONAL_INFO':
      return { ...state, personalInfo: action.info }
    case 'SET_SUITABILITY_INFO':
      return { ...state, suitabilityInfo: action.info }
    case 'RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

const PASS_KEY = 'wedbush_demo_authed'

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim().toLowerCase() === 'pumpernickel') {
      try { sessionStorage.setItem(PASS_KEY, '1') } catch {}
      onUnlock()
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <div className="password-gate">
      <form className={`password-card${shaking ? ' password-card--shake' : ''}`} onSubmit={handleSubmit}>
        <div className="password-card__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="password-card__title">Wedbush Pillar Platform</h1>
        <p className="password-card__subtitle">Enter the password to access the demo</p>
        <div className={`password-card__field${error ? ' password-card__field--error' : ''}`}>
          <input
            className="password-card__input"
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false) }}
            placeholder="Password\u2026"
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </div>
        {error && <p className="password-card__error" role="alert">Incorrect password</p>}
        <button className="password-card__submit" type="submit">
          Continue
        </button>
      </form>
    </div>
  )
}

export function App() {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(PASS_KEY) === '1' } catch { return false }
  })
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [announcement, setAnnouncement] = useState('')
  const prevCompletedRef = useRef(state.completedStages.length)

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' })
    setAnnouncement('Demo reset. Starting from step 1.')
  }, [])

  useEffect(() => {
    if (state.completedStages.length > prevCompletedRef.current) {
      const lastCompleted = state.completedStages[state.completedStages.length - 1]
      const stageInfo = STAGES.find((s) => s.id === lastCompleted)
      if (stageInfo) {
        setAnnouncement(`${stageInfo.label} completed successfully.`)
      }
    }
    prevCompletedRef.current = state.completedStages.length
  }, [state.completedStages])

  if (!authed) {
    return <PasswordGate onUnlock={() => setAuthed(true)} />
  }

  return (
    <div className="demo-layout">
      <a className="skip-link" href="#app-surface">Skip to content</a>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      <header className="demo-header">
        <span className="demo-header__logo">Wedbush Pillar Platform Demo</span>
        <StoryProgress
          currentStage={state.currentStage}
          completedStages={state.completedStages}
          onStageClick={(stage) => dispatch({ type: 'SET_STAGE', stage })}
        />
        <button className="demo-header__reset" onClick={handleReset} type="button">
          Reset Demo
        </button>
      </header>
      <div className="demo-body">
        <AppSurface state={state} dispatch={dispatch} />
        <ApiSequencePanel entries={state.apiLog} />
      </div>
    </div>
  )
}
