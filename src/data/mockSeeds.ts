import type { ThemePresetId } from '../types/wedbush'

export const MOCK_BANK = {
  bankName: 'National City Bank',
  accountType: 'CHECKING',
  maskedIdentifier: '****6721',
  routingNumber: '021000021',
}

export const DEPOSIT_AMOUNT = '500.00'
export const TRADE_NOTIONAL = '100.00'

export function uuid(): string {
  return crypto.randomUUID()
}

export interface StockInfo {
  symbol: string
  name: string
  price: string
  change: string
  changePercent: string
  color: string
}

export const STOCK_LIST: StockInfo[] = [
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: '178.72', change: '+3.41', changePercent: '+1.94%', color: '#e31937' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: '227.63', change: '+1.12', changePercent: '+0.49%', color: '#555555' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '174.50', change: '-0.87', changePercent: '-0.50%', color: '#4285f4' },
  { symbol: 'AMZN', name: 'Amazon.com', price: '198.34', change: '+2.65', changePercent: '+1.35%', color: '#ff9900' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: '415.20', change: '+0.58', changePercent: '+0.14%', color: '#00a4ef' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '136.40', change: '+4.23', changePercent: '+3.20%', color: '#76b900' },
]

export interface EventContractInfo {
  id: string
  question: string
  category: string
  yesPrice: string
  noPrice: string
  expiresAt: string
}

export const EVENT_CONTRACTS_LIST: EventContractInfo[] = [
  { id: 'ec-1', question: 'Will BTC exceed $120,000 by July 2026?', category: 'Crypto', yesPrice: '0.42', noPrice: '0.58', expiresAt: '2026-07-01' },
  { id: 'ec-2', question: 'Will the Fed cut rates in June 2026?', category: 'Economy', yesPrice: '0.65', noPrice: '0.35', expiresAt: '2026-06-18' },
  { id: 'ec-3', question: 'Will TSLA reach $250 by Q3 2026?', category: 'Stocks', yesPrice: '0.28', noPrice: '0.72', expiresAt: '2026-09-30' },
  { id: 'ec-4', question: 'Will US GDP growth exceed 3% in 2026?', category: 'Economy', yesPrice: '0.38', noPrice: '0.62', expiresAt: '2026-12-31' },
]

export const OIL_EVENT_CONTRACT: EventContractInfo = {
  id: 'ec-oil',
  question: 'Will crude oil exceed $120 per barrel by Q3 2026?',
  category: 'Commodities',
  yesPrice: '0.72',
  noPrice: '0.28',
  expiresAt: '2026-09-30',
}

export interface ThemePreset {
  id: ThemePresetId
  label: string
  bg: string
  surface: string
  surfaceRaised: string
  border: string
  borderSubtle: string
  accent: string
  accentHover: string
  accentDim: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'blue',
    label: 'Blue',
    bg: '#f3f7ff',
    surface: '#ffffff',
    surfaceRaised: '#f7faff',
    border: '#d8e4fb',
    borderSubtle: '#e7eefb',
    accent: '#3478f6',
    accentHover: '#2563e6',
    accentDim: 'rgba(52, 120, 246, 0.12)',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    bg: '#f1faf6',
    surface: '#ffffff',
    surfaceRaised: '#f5fcf8',
    border: '#d2eadf',
    borderSubtle: '#e3f2eb',
    accent: '#059669',
    accentHover: '#047857',
    accentDim: 'rgba(5, 150, 105, 0.12)',
  },
  {
    id: 'violet',
    label: 'Violet',
    bg: '#f7f4ff',
    surface: '#ffffff',
    surfaceRaised: '#faf8ff',
    border: '#e3daf8',
    borderSubtle: '#eee8fb',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentDim: 'rgba(124, 58, 237, 0.12)',
  },
  {
    id: 'rose',
    label: 'Rose',
    bg: '#fff4f7',
    surface: '#ffffff',
    surfaceRaised: '#fff7f9',
    border: '#f6d9e2',
    borderSubtle: '#fae7ed',
    accent: '#e11d48',
    accentHover: '#be123c',
    accentDim: 'rgba(225, 29, 72, 0.12)',
  },
  {
    id: 'orange',
    label: 'Orange',
    bg: '#fff7f1',
    surface: '#ffffff',
    surfaceRaised: '#fffaf6',
    border: '#f5dfce',
    borderSubtle: '#faebdf',
    accent: '#ea580c',
    accentHover: '#c2410c',
    accentDim: 'rgba(234, 88, 12, 0.12)',
  },
  {
    id: 'slate',
    label: 'Slate',
    bg: '#f4f6f8',
    surface: '#ffffff',
    surfaceRaised: '#f8fafb',
    border: '#dbe2e8',
    borderSubtle: '#e7edf2',
    accent: '#475569',
    accentHover: '#334155',
    accentDim: 'rgba(71, 85, 105, 0.12)',
  },
]

export const DEMO_PERSONAL_INFO = {
  firstName: 'Alex',
  middleName: 'J',
  lastName: 'Morgan',
  suffix: '',
  tin: '123-45-6789',
  dateOfBirth: '1990-06-15',
  countryOfLegalResidence: 'USA',
  email: 'alex.morgan@example.com',
  phone: '+1 (212) 555-0147',
  addressLine1: '350 Fifth Avenue',
  city: 'New York',
  state: 'US-NY',
  zip: '10118',
} as const

export const DEMO_SUITABILITY_INFO = {
  employmentType: 'EMPLOYED',
  occupation: 'Product Manager',
  typeOfBusiness: 'INFORMATION',
  employer: 'Acme Technologies',
  businessPhone: '+1 (212) 555-0200',
  businessAddress: '350 Fifth Avenue, New York, NY',
  liquidNetWorth: '250000',
  totalNetWorth: '500000',
  investmentObjective: 'GROWTH',
  riskTolerance: 'MODERATE',
} as const

export const US_STATES = [
  { value: 'US-AL', label: 'Alabama' }, { value: 'US-AK', label: 'Alaska' },
  { value: 'US-AZ', label: 'Arizona' }, { value: 'US-AR', label: 'Arkansas' },
  { value: 'US-CA', label: 'California' }, { value: 'US-CO', label: 'Colorado' },
  { value: 'US-CT', label: 'Connecticut' }, { value: 'US-DE', label: 'Delaware' },
  { value: 'US-FL', label: 'Florida' }, { value: 'US-GA', label: 'Georgia' },
  { value: 'US-HI', label: 'Hawaii' }, { value: 'US-ID', label: 'Idaho' },
  { value: 'US-IL', label: 'Illinois' }, { value: 'US-IN', label: 'Indiana' },
  { value: 'US-IA', label: 'Iowa' }, { value: 'US-KS', label: 'Kansas' },
  { value: 'US-KY', label: 'Kentucky' }, { value: 'US-LA', label: 'Louisiana' },
  { value: 'US-ME', label: 'Maine' }, { value: 'US-MD', label: 'Maryland' },
  { value: 'US-MA', label: 'Massachusetts' }, { value: 'US-MI', label: 'Michigan' },
  { value: 'US-MN', label: 'Minnesota' }, { value: 'US-MS', label: 'Mississippi' },
  { value: 'US-MO', label: 'Missouri' }, { value: 'US-MT', label: 'Montana' },
  { value: 'US-NE', label: 'Nebraska' }, { value: 'US-NV', label: 'Nevada' },
  { value: 'US-NH', label: 'New Hampshire' }, { value: 'US-NJ', label: 'New Jersey' },
  { value: 'US-NM', label: 'New Mexico' }, { value: 'US-NY', label: 'New York' },
  { value: 'US-NC', label: 'North Carolina' }, { value: 'US-ND', label: 'North Dakota' },
  { value: 'US-OH', label: 'Ohio' }, { value: 'US-OK', label: 'Oklahoma' },
  { value: 'US-OR', label: 'Oregon' }, { value: 'US-PA', label: 'Pennsylvania' },
  { value: 'US-RI', label: 'Rhode Island' }, { value: 'US-SC', label: 'South Carolina' },
  { value: 'US-SD', label: 'South Dakota' }, { value: 'US-TN', label: 'Tennessee' },
  { value: 'US-TX', label: 'Texas' }, { value: 'US-UT', label: 'Utah' },
  { value: 'US-VT', label: 'Vermont' }, { value: 'US-VA', label: 'Virginia' },
  { value: 'US-WA', label: 'Washington' }, { value: 'US-WV', label: 'West Virginia' },
  { value: 'US-WI', label: 'Wisconsin' }, { value: 'US-WY', label: 'Wyoming' },
  { value: 'US-DC', label: 'District of Columbia' },
]

export const EMPLOYMENT_TYPES = [
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'NOT_EMPLOYED', label: 'Not Employed' },
]

export const BUSINESS_TYPES = [
  { value: 'INFORMATION', label: 'Information / Technology' },
  { value: 'FINANCE_AND_INSURANCE', label: 'Finance & Insurance' },
  { value: 'HEALTH_CARE_AND_SOCIAL_ASSISTANCE', label: 'Healthcare' },
  { value: 'EDUCATIONAL_SERVICES', label: 'Education' },
  { value: 'RETAIL_TRADE', label: 'Retail Trade' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'PROFESSIONAL_SCIENTIFIC_AND_TECHNICAL_SERVICES', label: 'Professional Services' },
  { value: 'REAL_ESTATE_AND_RENTAL_AND_LEASING', label: 'Real Estate' },
  { value: 'OTHER_SERVICES', label: 'Other' },
]

export const NET_WORTH_RANGES = [
  { value: '25000', label: 'Under $25,000' },
  { value: '50000', label: '$25,000 - $50,000' },
  { value: '100000', label: '$50,000 - $100,000' },
  { value: '250000', label: '$100,000 - $250,000' },
  { value: '500000', label: '$250,000 - $500,000' },
  { value: '1000000', label: '$500,000 - $1,000,000' },
  { value: '5000000', label: 'Over $1,000,000' },
]

export const INVESTMENT_OBJECTIVES = [
  { value: 'INCOME', label: 'Income' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'SPECULATION', label: 'Speculation' },
  { value: 'TRADING', label: 'Trading' },
]

export const RISK_TOLERANCES = [
  { value: 'CONSERVATIVE', label: 'Conservative' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'AGGRESSIVE', label: 'Aggressive' },
]
