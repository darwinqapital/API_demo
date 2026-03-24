export type AccountTypeChoice = 'EVENT_CONTRACTS' | 'FINTECH_RETAIL' | 'CRYPTO'

export type DemoStage =
  | 'choose-accounts'
  | 'personal-info'
  | 'suitability'
  | 'deposit-funds'
  | 'explore-markets'

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

export interface AppState {
  currentStage: DemoStage
  completedStages: DemoStage[]
  isProcessing: boolean
  apiLog: ApiLogEntry[]

  selectedAccountTypes: AccountTypeChoice[]
  personalInfo: PersonalInfo
  suitabilityInfo: SuitabilityInfo

  token: string | null
  clientId: string | null
  accountIds: Record<string, string>
  paymentAccountId: string | null
  balance: string | null

  kycStatus: 'idle' | 'verifying' | 'approved' | 'denied'
}

export const INITIAL_STATE: AppState = {
  currentStage: 'choose-accounts',
  completedStages: [],
  isProcessing: false,
  apiLog: [],

  selectedAccountTypes: [],
  personalInfo: { ...EMPTY_PERSONAL_INFO },
  suitabilityInfo: { ...EMPTY_SUITABILITY_INFO },

  token: null,
  clientId: null,
  accountIds: {},
  paymentAccountId: null,
  balance: null,

  kycStatus: 'idle',
}
