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

export function App() {
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
