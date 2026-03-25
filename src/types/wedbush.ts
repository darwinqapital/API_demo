export type AccountTypeChoice = 'EVENT_CONTRACTS' | 'FINTECH_RETAIL' | 'CRYPTO'

export type DemoMode = 'mobile-app' | 'news-reel'

export type ThemePresetId = 'blue' | 'emerald' | 'violet' | 'rose' | 'orange' | 'slate'

export type DemoStage =
  | 'demo-setup'
  | 'choose-accounts'
  | 'news-feed'
  | 'news-reel-disclosure'
  | 'personal-info'
  | 'suitability'
  | 'deposit-funds'
  | 'explore-markets'
  | 'transaction-history'

export interface StageInfo {
  id: DemoStage
  label: string
  description: string
}

export const STAGES: StageInfo[] = [
  { id: 'choose-accounts', label: 'Account Type', description: 'Choose which accounts to open' },
  { id: 'personal-info', label: 'Personal Info', description: 'Enter your personal information' },
  { id: 'suitability', label: 'Suitability', description: 'Investment profile and KYC verification' },
  { id: 'deposit-funds', label: 'Fund Account', description: 'Deposit funds into your account' },
  { id: 'explore-markets', label: 'Explore', description: 'Browse stocks and event contracts' },
  { id: 'transaction-history', label: 'History', description: 'View transaction history' },
]

export const NEWS_REEL_STAGES: StageInfo[] = [
  { id: 'news-feed', label: 'News Feed', description: 'Breaking news event' },
  { id: 'news-reel-disclosure', label: 'Disclosure', description: 'Review and accept event contract risks' },
  { id: 'personal-info', label: 'Personal Info', description: 'Enter your personal information' },
  { id: 'suitability', label: 'Suitability', description: 'Investment profile and KYC verification' },
  { id: 'deposit-funds', label: 'Fund Account', description: 'Deposit funds into your account' },
  { id: 'explore-markets', label: 'Explore', description: 'Browse event contracts' },
  { id: 'transaction-history', label: 'History', description: 'View transaction history' },
]

export interface ApiLogEntry {
  id: string
  stageId: DemoStage
  method: 'GET' | 'POST' | 'PATCH'
  path: string
  description: string
  requestBody?: unknown
  responseBody?: unknown
  statusCode: number
  timestamp: number
  durationMs: number
}

export interface PersonalInfo {
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  tin: string
  dateOfBirth: string
  countryOfLegalResidence: string
  email: string
  phone: string
  addressLine1: string
  city: string
  state: string
  zip: string
}

export interface SuitabilityInfo {
  employmentType: string
  occupation: string
  typeOfBusiness: string
  employer: string
  businessPhone: string
  businessAddress: string
  liquidNetWorth: string
  totalNetWorth: string
  investmentObjective: string
  riskTolerance: string
}

export const EMPTY_PERSONAL_INFO: PersonalInfo = {
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  tin: '',
  dateOfBirth: '',
  countryOfLegalResidence: 'USA',
  email: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  zip: '',
}

export const EMPTY_SUITABILITY_INFO: SuitabilityInfo = {
  employmentType: '',
  occupation: '',
  typeOfBusiness: '',
  employer: '',
  businessPhone: '',
  businessAddress: '',
  liquidNetWorth: '',
  totalNetWorth: '',
  investmentObjective: '',
  riskTolerance: '',
}

// Mirrors WTS GET /v1/accounts/{accountId}/transactions schema
export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'DIVIDEND'
  | 'MARKET_BUY'
  | 'MARKET_SELL'
  | 'LIMIT_BUY'
  | 'LIMIT_SELL'

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'

export interface InstrumentIdentifiers {
  instrumentId: string
  cusip?: string
  isin?: string
  symbol: string
}

export interface BaseTransaction {
  id: string
  submittedDate: string
  completedDate?: string
  status: TransactionStatus
  currency: string
}

export interface NonTradeTransaction extends BaseTransaction {
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND'
  amount: string
}

export interface TradeTransaction extends BaseTransaction {
  type: 'MARKET_BUY' | 'MARKET_SELL' | 'LIMIT_BUY' | 'LIMIT_SELL'
  instrumentIdentifiers: InstrumentIdentifiers
  enteredQuantity: string
  filledQuantity: string
  averagePrice: string
}

export type Transaction = NonTradeTransaction | TradeTransaction

export function isTradeTransaction(tx: Transaction): tx is TradeTransaction {
  return ['MARKET_BUY', 'MARKET_SELL', 'LIMIT_BUY', 'LIMIT_SELL'].includes(tx.type)
}

export interface AppState {
  currentStage: DemoStage
  completedStages: DemoStage[]
  isProcessing: boolean
  apiLog: ApiLogEntry[]

  partnerName: string
  themePreset: ThemePresetId
  selectedAccountTypes: AccountTypeChoice[]
  personalInfo: PersonalInfo
  suitabilityInfo: SuitabilityInfo

  token: string | null
  clientId: string | null
  accountIds: Record<string, string>
  paymentAccountId: string | null
  balance: string | null

  kycStatus: 'idle' | 'verifying' | 'approved' | 'denied'

  transactions: Transaction[]
}

export const INITIAL_STATE: AppState = {
  currentStage: 'demo-setup',
  completedStages: [],
  isProcessing: false,
  apiLog: [],

  partnerName: '',
  themePreset: 'blue',
  selectedAccountTypes: [],
  personalInfo: { ...EMPTY_PERSONAL_INFO },
  suitabilityInfo: { ...EMPTY_SUITABILITY_INFO },

  token: null,
  clientId: null,
  accountIds: {},
  paymentAccountId: null,
  balance: null,

  kycStatus: 'idle',

  transactions: [],
}
