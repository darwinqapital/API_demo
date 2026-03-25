import { useCallback, useEffect, useReducer, useRef, useState, type CSSProperties } from 'react'
import { StoryProgress } from './components/StoryProgress'
import { AppSurface } from './components/AppSurface'
import { ApiSequencePanel } from './components/ApiSequencePanel'
import { type AppState, type DemoMode, type DemoStage, INITIAL_STATE, STAGES, NEWS_REEL_STAGES, type ApiLogEntry } from './types/wedbush'
import type { Action } from './sim/scenarioEngine'
import { THEME_PRESETS } from './data/mockSeeds'

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
    case 'SET_PARTNER_NAME':
      return { ...state, partnerName: action.partnerName }
    case 'SET_THEME_PRESET':
      return { ...state, themePreset: action.themePreset }
    case 'SET_SELECTED_ACCOUNT_TYPES':
      return { ...state, selectedAccountTypes: action.types }
    case 'SET_PERSONAL_INFO':
      return { ...state, personalInfo: action.info }
    case 'SET_SUITABILITY_INFO':
      return { ...state, suitabilityInfo: action.info }
    case 'RESET':
      return {
        ...INITIAL_STATE,
        currentStage: action.stage ?? INITIAL_STATE.currentStage,
        partnerName: state.partnerName,
        themePreset: state.themePreset,
      }
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
  const [demoMode, setDemoMode] = useState<DemoMode>('mobile-app')
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [announcement, setAnnouncement] = useState('')
  const prevCompletedRef = useRef(state.completedStages.length)

  const startStageForMode = useCallback(
    (mode: DemoMode): DemoStage => (mode === 'news-reel' ? 'news-feed' : 'choose-accounts'),
    [],
  )
  const activeStages = demoMode === 'news-reel' ? NEWS_REEL_STAGES : STAGES
  const showStoryProgress = state.currentStage !== 'demo-setup'
  const activeTheme = THEME_PRESETS.find((preset) => preset.id === state.themePreset) ?? THEME_PRESETS[0]
  const themeStyle = {
    '--color-accent': activeTheme.accent,
    '--color-accent-hover': activeTheme.accentHover,
    '--color-accent-dim': activeTheme.accentDim,
  } as CSSProperties

  const handleModeChange = useCallback((mode: DemoMode) => {
    setDemoMode(mode)
    if (state.currentStage !== 'demo-setup') {
      dispatch({ type: 'RESET', stage: startStageForMode(mode) })
      setAnnouncement(`Switched to ${mode === 'news-reel' ? 'News Reel Demo' : 'Mobile App Journey'}.`)
    }
  }, [startStageForMode, state.currentStage])

  const handleReset = useCallback(() => {
    const stage = state.currentStage === 'demo-setup' ? 'demo-setup' : startStageForMode(demoMode)
    dispatch({ type: 'RESET', stage })
    setAnnouncement(stage === 'demo-setup' ? 'Demo setup reset.' : 'Demo reset. Starting from step 1.')
  }, [demoMode, startStageForMode, state.currentStage])

  useEffect(() => {
    if (state.completedStages.length > prevCompletedRef.current) {
      const lastCompleted = state.completedStages[state.completedStages.length - 1]
      const stageInfo = activeStages.find((s) => s.id === lastCompleted)
      if (stageInfo) {
        setAnnouncement(`${stageInfo.label} completed successfully.`)
      }
    }
    prevCompletedRef.current = state.completedStages.length
  }, [state.completedStages, activeStages])

  if (!authed) {
    return <PasswordGate onUnlock={() => setAuthed(true)} />
  }

  return (
    <div className="demo-layout" style={themeStyle}>
      <a className="skip-link" href="#app-surface">Skip to content</a>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      <header className="demo-header">
        <div className="mode-toggle" role="radiogroup" aria-label="Demo mode">
          <button
            className={`mode-toggle__btn${demoMode === 'mobile-app' ? ' mode-toggle__btn--active' : ''}`}
            onClick={() => handleModeChange('mobile-app')}
            role="radio"
            aria-checked={demoMode === 'mobile-app'}
            type="button"
          >
            Mobile App Journey
          </button>
          <button
            className={`mode-toggle__btn${demoMode === 'news-reel' ? ' mode-toggle__btn--active' : ''}`}
            onClick={() => handleModeChange('news-reel')}
            role="radio"
            aria-checked={demoMode === 'news-reel'}
            type="button"
          >
            News Reel Demo
          </button>
        </div>
        <span className="demo-header__logo">
          Wedbush Pillar Platform Demo
          {state.partnerName.trim() ? ` - ${state.partnerName.trim()}` : ''}
        </span>
        {showStoryProgress && (
          <StoryProgress
            stages={activeStages}
            currentStage={state.currentStage}
            completedStages={state.completedStages}
            onStageClick={(stage) => dispatch({ type: 'SET_STAGE', stage })}
          />
        )}
        <button className="demo-header__reset" onClick={handleReset} type="button">
          Reset Demo
        </button>
      </header>
      <div className="demo-body">
        <AppSurface state={state} dispatch={dispatch} demoMode={demoMode} />
        <ApiSequencePanel entries={state.apiLog} />
      </div>
    </div>
  )
}
