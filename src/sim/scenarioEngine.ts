import type { Dispatch } from 'react'
import type { ApiLogEntry, DemoStage, AppState, Transaction } from '../types/wedbush'
import {
  simulateAuth,
  simulateCreateClient,
  simulateUpdateSuitability,
  simulateCreateAccounts,
  simulateDepositFunds,
  simulatePlaceOrder,
  simulateGetTransactions,
  type OrderSizing,
} from './apiSimulator'
import { STAGES } from '../types/wedbush'
import { uuid } from '../data/mockSeeds'

export type Action =
  | { type: 'SET_STAGE'; stage: DemoStage }
  | { type: 'COMPLETE_STAGE'; stage: DemoStage }
  | { type: 'SET_PROCESSING'; value: boolean }
  | { type: 'ADD_LOG'; entry: ApiLogEntry }
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'SET_TOKEN'; token: string }
  | { type: 'SET_CLIENT_ID'; id: string }
  | { type: 'SET_ACCOUNT_IDS'; ids: Record<string, string> }
  | { type: 'SET_PAYMENT_ACCOUNT_ID'; id: string }
  | { type: 'SET_BALANCE'; balance: string }
  | { type: 'SET_KYC_STATUS'; status: AppState['kycStatus'] }
  | { type: 'SET_PARTNER_NAME'; partnerName: string }
  | { type: 'SET_THEME_PRESET'; themePreset: AppState['themePreset'] }
  | { type: 'SET_SELECTED_ACCOUNT_TYPES'; types: AppState['selectedAccountTypes'] }
  | { type: 'SET_PERSONAL_INFO'; info: AppState['personalInfo'] }
  | { type: 'SET_SUITABILITY_INFO'; info: AppState['suitabilityInfo'] }
  | { type: 'RESET'; stage?: DemoStage }

function addLog(dispatch: Dispatch<Action>) {
  return (entry: ApiLogEntry) => dispatch({ type: 'ADD_LOG', entry })
}

function nextStage(current: DemoStage): DemoStage | null {
  const idx = STAGES.findIndex((s) => s.id === current)
  return idx < STAGES.length - 1 ? STAGES[idx + 1].id : null
}

export async function runChooseAccounts(
  dispatch: Dispatch<Action>,
) {
  dispatch({ type: 'SET_PROCESSING', value: true })
  try {
    const result = await simulateAuth(addLog(dispatch))
    dispatch({ type: 'SET_TOKEN', token: result.token })
    dispatch({ type: 'COMPLETE_STAGE', stage: 'choose-accounts' })
    dispatch({ type: 'SET_STAGE', stage: 'personal-info' })
  } finally {
    dispatch({ type: 'SET_PROCESSING', value: false })
  }
}

export async function runNewsFeedScan(
  dispatch: Dispatch<Action>,
) {
  dispatch({ type: 'SET_PROCESSING', value: true })
  try {
    dispatch({ type: 'SET_SELECTED_ACCOUNT_TYPES', types: ['EVENT_CONTRACTS'] })
    const result = await simulateAuth(addLog(dispatch))
    dispatch({ type: 'SET_TOKEN', token: result.token })
    dispatch({ type: 'COMPLETE_STAGE', stage: 'news-feed' })
    dispatch({ type: 'SET_STAGE', stage: 'news-reel-disclosure' })
  } finally {
    dispatch({ type: 'SET_PROCESSING', value: false })
  }
}

export async function runPersonalInfo(
  dispatch: Dispatch<Action>,
  state: AppState,
) {
  dispatch({ type: 'SET_PROCESSING', value: true })
  try {
    const result = await simulateCreateClient(addLog(dispatch), state.personalInfo)
    dispatch({ type: 'SET_CLIENT_ID', id: result.clientId })
    dispatch({ type: 'COMPLETE_STAGE', stage: 'personal-info' })
    dispatch({ type: 'SET_STAGE', stage: 'suitability' })
  } finally {
    dispatch({ type: 'SET_PROCESSING', value: false })
  }
}

function delayP(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

export async function runSuitability(
  dispatch: Dispatch<Action>,
  state: AppState,
) {
  dispatch({ type: 'SET_PROCESSING', value: true })
  try {
    await simulateUpdateSuitability(addLog(dispatch), state.clientId!, state.suitabilityInfo)

    dispatch({ type: 'SET_KYC_STATUS', status: 'verifying' })
    await delayP(2500)
    dispatch({ type: 'SET_KYC_STATUS', status: 'approved' })

    const accountIds = await simulateCreateAccounts(
      addLog(dispatch),
      state.clientId!,
      state.selectedAccountTypes,
      state.suitabilityInfo.investmentObjective,
      state.suitabilityInfo.riskTolerance,
    )
    dispatch({ type: 'SET_ACCOUNT_IDS', ids: accountIds })
    dispatch({ type: 'COMPLETE_STAGE', stage: 'suitability' })

    await delayP(800)
    dispatch({ type: 'SET_STAGE', stage: 'deposit-funds' })
  } finally {
    dispatch({ type: 'SET_PROCESSING', value: false })
  }
}

export async function runDeposit(
  dispatch: Dispatch<Action>,
  state: AppState,
  depositAmount: string,
) {
  dispatch({ type: 'SET_PROCESSING', value: true })
  try {
    const primaryAccountId =
      state.accountIds['FINTECH_RETAIL'] ||
      state.accountIds['CRYPTO'] ||
      Object.values(state.accountIds)[0]

    const result = await simulateDepositFunds(
      addLog(dispatch),
      state.clientId!,
      primaryAccountId,
      state.personalInfo,
      depositAmount,
    )
    dispatch({ type: 'SET_PAYMENT_ACCOUNT_ID', id: result.paymentAccountId })
    dispatch({ type: 'SET_BALANCE', balance: result.balance })

    const now = new Date().toISOString()
    dispatch({
      type: 'ADD_TRANSACTION',
      transaction: {
        id: uuid(),
        type: 'DEPOSIT',
        status: 'COMPLETED',
        submittedDate: now,
        completedDate: now,
        amount: depositAmount,
        currency: 'USD',
      },
    })

    dispatch({ type: 'COMPLETE_STAGE', stage: 'deposit-funds' })
    dispatch({ type: 'SET_STAGE', stage: 'explore-markets' })
  } finally {
    dispatch({ type: 'SET_PROCESSING', value: false })
  }
}

export async function runPlaceOrder(
  dispatch: Dispatch<Action>,
  state: AppState,
  symbol: string,
  price: string,
  sizing: OrderSizing,
  assetClass: 'EQUITY' | 'EVENT_CONTRACT' = 'EQUITY',
) {
  dispatch({ type: 'SET_PROCESSING', value: true })
  try {
    const accountId = assetClass === 'EVENT_CONTRACT'
      ? (state.accountIds['EVENT_CONTRACTS'] || Object.values(state.accountIds)[0])
      : (state.accountIds['FINTECH_RETAIL'] || state.accountIds['CRYPTO'] || Object.values(state.accountIds)[0])

    const result = await simulatePlaceOrder(addLog(dispatch), accountId, symbol, price, sizing, assetClass)

    const currentBalance = parseFloat(state.balance || '0')
    const spent = parseFloat(result.cost)
    const newBalance = Math.max(0, currentBalance - spent).toFixed(2)
    dispatch({ type: 'SET_BALANCE', balance: newBalance })

    const now = new Date().toISOString()
    dispatch({
      type: 'ADD_TRANSACTION',
      transaction: {
        id: result.orderId,
        type: 'MARKET_BUY',
        status: 'COMPLETED',
        submittedDate: now,
        completedDate: now,
        instrumentIdentifiers: {
          instrumentId: uuid(),
          symbol,
        },
        enteredQuantity: result.shares,
        filledQuantity: result.shares,
        averagePrice: result.price,
        currency: 'USD',
      },
    })

    dispatch({ type: 'SET_STAGE', stage: 'transaction-history' })
  } finally {
    dispatch({ type: 'SET_PROCESSING', value: false })
  }
}

export async function runViewTransactions(
  dispatch: Dispatch<Action>,
  state: AppState,
) {
  dispatch({ type: 'SET_PROCESSING', value: true })
  try {
    const accountId = Object.values(state.accountIds)[0]
    if (accountId) {
      await simulateGetTransactions(addLog(dispatch), accountId, state.transactions)
    }
  } finally {
    dispatch({ type: 'SET_PROCESSING', value: false })
  }
}
