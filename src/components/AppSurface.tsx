import { type Dispatch, useState, useRef, useEffect } from 'react'
import { PhoneFrame } from './PhoneFrame'
import {
  runChooseAccounts,
  runNewsFeedScan,
  runPersonalInfo,
  runSuitability,
  runDeposit,
  runPlaceOrder,
  runViewTransactions,
  type Action,
} from '../sim/scenarioEngine'
import type { OrderSizing } from '../sim/apiSimulator'
import type { AppState, DemoMode, DemoStage, AccountTypeChoice, PersonalInfo, SuitabilityInfo } from '../types/wedbush'
import { isTradeTransaction, type Transaction } from '../types/wedbush'
import {
  MOCK_BANK,
  DEPOSIT_AMOUNT,
  STOCK_LIST,
  EVENT_CONTRACTS_LIST,
  OIL_EVENT_CONTRACT,
  THEME_PRESETS,
  US_STATES,
  EMPLOYMENT_TYPES,
  BUSINESS_TYPES,
  NET_WORTH_RANGES,
  INVESTMENT_OBJECTIVES,
  RISK_TOLERANCES,
  DEMO_PERSONAL_INFO,
  DEMO_SUITABILITY_INFO,
} from '../data/mockSeeds'
import disclosureSample from '../../docs/Disclosures sample.md?raw'

interface Props {
  state: AppState
  dispatch: Dispatch<Action>
  demoMode?: DemoMode
}

// ─── Shared ───

function ActionButton({
  onClick,
  isProcessing,
  disabled,
  label,
}: {
  onClick: () => void
  isProcessing: boolean
  disabled?: boolean
  label: string
}) {
  return (
    <button
      className="action-btn"
      onClick={onClick}
      disabled={isProcessing || disabled}
      type="button"
    >
      {isProcessing && <span className="spinner" aria-hidden="true" />}
      {label}
    </button>
  )
}

function SuccessButton({ label }: { label: string }) {
  return (
    <button className="action-btn action-btn--success" disabled type="button">
      <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {label}
    </button>
  )
}

function AutoFillToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: (on: boolean) => void
}) {
  return (
    <label className={`autofill-toggle${enabled ? ' autofill-toggle--on' : ''}`}>
      <input
        type="checkbox"
        className="autofill-toggle__input"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        aria-label="Auto-fill demo data"
      />
      <span className="autofill-toggle__label">Auto-fill</span>
      <span className="autofill-toggle__track" aria-hidden="true">
        <span className="autofill-toggle__thumb" />
      </span>
    </label>
  )
}

function formatDisclosureCopy(partnerName: string) {
  const platformName = partnerName.trim() || 'your platform'
  return disclosureSample.split('[Insert Platform Name]').join(platformName)
}

function DemoSetupStep({ state, dispatch, demoMode = 'mobile-app' }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const partnerName = state.partnerName
  const startStage: DemoStage = demoMode === 'news-reel' ? 'news-feed' : 'choose-accounts'
  const partnerError = submitted && !partnerName.trim() ? 'Partner name is required' : undefined

  const handleContinue = () => {
    setSubmitted(true)
    if (!partnerName.trim()) return
    dispatch({ type: 'SET_STAGE', stage: startStage })
  }

  return (
    <PhoneFrame
      title="Demo Setup"
      subtitle="Set the partner name and theme before you begin."
      footer={(
        <ActionButton
          onClick={handleContinue}
          isProcessing={false}
          label={`Start ${demoMode === 'news-reel' ? 'News Reel Demo' : 'Mobile App Journey'}`}
        />
      )}
    >
      <FormField label="Partner Name" error={partnerError} required>
        <input
          className="form-input"
          name="partnerName"
          value={partnerName}
          onChange={(e) => dispatch({ type: 'SET_PARTNER_NAME', partnerName: e.target.value })}
          autoComplete="organization"
          placeholder="Acme Wealth…"
          aria-invalid={partnerError ? 'true' : undefined}
        />
      </FormField>

      <FormField label="Theme Color" required>
        <select
          className="form-select"
          name="themePreset"
          value={state.themePreset}
          onChange={(e) => dispatch({ type: 'SET_THEME_PRESET', themePreset: e.target.value as AppState['themePreset'] })}
        >
          {THEME_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="setup-summary" aria-live="polite">
        <div className="setup-summary__label">Disclosure preview</div>
        <p className="setup-summary__copy">
          {`[Insert Platform Name] will appear as ${partnerName.trim() || 'your partner name'} in the disclosure step.`}
        </p>
      </div>
    </PhoneFrame>
  )
}

function NewsReelDisclosureStep({ state, dispatch }: Props) {
  const [accepted, setAccepted] = useState(false)
  const disclosureCopy = formatDisclosureCopy(state.partnerName)

  const handleContinue = () => {
    if (!accepted) return
    dispatch({ type: 'COMPLETE_STAGE', stage: 'news-reel-disclosure' })
    dispatch({ type: 'SET_STAGE', stage: 'personal-info' })
  }

  return (
    <PhoneFrame
      title="Risk Disclosure"
      subtitle={`Review the event contract disclosure for ${state.partnerName.trim() || 'your partner'}.`}
      onBack={() => dispatch({ type: 'SET_STAGE', stage: 'news-feed' })}
      footer={(
        <div className="disclosure-step__footer">
          <label className="disclosure-step__checkbox">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>I have read and agree to the disclosure.</span>
          </label>
          <button
            className="action-btn"
            onClick={handleContinue}
            disabled={!accepted}
            type="button"
            aria-describedby={!accepted ? 'disclosure-consent-note' : undefined}
          >
            Continue
          </button>
          {!accepted && (
            <p className="disclosure-step__note" id="disclosure-consent-note">
              Check the box to continue.
            </p>
          )}
        </div>
      )}
    >
      <div className="disclosure-step__content">
        <p className="disclosure-step__intro">
          Please review the disclosure below before continuing.
        </p>
        <div
          className="disclosure-step__textbox"
          role="region"
          aria-label="Disclosure statement"
          tabIndex={0}
        >
          {disclosureCopy}
        </div>
      </div>
    </PhoneFrame>
  )
}

// ─── Step 1: Choose Accounts ───

const ACCOUNT_CHOICES: { id: AccountTypeChoice; icon: string; title: string; description: string }[] = [
  {
    id: 'EVENT_CONTRACTS',
    icon: '\u{1F52E}',
    title: 'I want to predict the future',
    description: 'Trade event contracts on real-world outcomes with limited risk.',
  },
  {
    id: 'FINTECH_RETAIL',
    icon: '\u{1F4C8}',
    title: 'I want to invest in stocks',
    description: 'Build a portfolio of stocks and ETFs with no commissions.',
  },
  {
    id: 'CRYPTO',
    icon: '\u{26A1}',
    title: 'I want to trade in Crypto',
    description: 'Buy and sell cryptocurrency in an individual taxable account.',
  },
]

function ChooseAccountsStep({ state, dispatch }: Props) {
  const selected = state.selectedAccountTypes

  const toggle = (id: AccountTypeChoice) => {
    const next = selected.includes(id)
      ? selected.filter((t) => t !== id)
      : [...selected, id]
    dispatch({ type: 'SET_SELECTED_ACCOUNT_TYPES', types: next })
  }

  const handleContinue = () => {
    runChooseAccounts(dispatch)
  }

  return (
    <PhoneFrame
      title="Where do you want to start?"
      subtitle="You can open a new account in just 5 minutes."
      footer={
        <ActionButton
          onClick={handleContinue}
          isProcessing={state.isProcessing}
          disabled={selected.length === 0}
          label="Continue"
        />
      }
    >
      {ACCOUNT_CHOICES.map((choice) => {
        const isSelected = selected.includes(choice.id)
        return (
          <label
            key={choice.id}
            className={`choice-card${isSelected ? ' choice-card--selected' : ''}`}
          >
            <input
              type="checkbox"
              className="choice-card__input"
              checked={isSelected}
              onChange={() => toggle(choice.id)}
              aria-label={choice.title}
            />
            <span className="choice-card__icon" aria-hidden="true">{choice.icon}</span>
            <span className="choice-card__content">
              <span className="choice-card__title">{choice.title}</span>
              <span className="choice-card__desc">{choice.description}</span>
            </span>
            <span className="choice-card__check" aria-hidden="true">
              {isSelected && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          </label>
        )
      })}
    </PhoneFrame>
  )
}

// ─── Step 2: Personal Info ───

function PersonalInfoStep({ state, dispatch }: Props) {
  const info = state.personalInfo
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [autoFill, setAutoFill] = useState(false)

  const handleAutoFill = (on: boolean) => {
    setAutoFill(on)
    if (on) {
      dispatch({ type: 'SET_PERSONAL_INFO', info: { ...DEMO_PERSONAL_INFO } })
      setErrors({})
    }
  }

  const update = (field: keyof PersonalInfo, value: string) => {
    dispatch({ type: 'SET_PERSONAL_INFO', info: { ...info, [field]: value } })
    if (submitted) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof PersonalInfo, string>> = {}
    if (!info.firstName.trim()) e.firstName = 'Required'
    if (!info.lastName.trim()) e.lastName = 'Required'
    if (!info.tin.trim()) e.tin = 'Required'
    if (!info.dateOfBirth) e.dateOfBirth = 'Required'
    if (!info.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) e.email = 'Invalid email'
    if (!info.phone.trim()) e.phone = 'Required'
    if (!info.addressLine1.trim()) e.addressLine1 = 'Required'
    if (!info.city.trim()) e.city = 'Required'
    if (!info.state) e.state = 'Required'
    if (!info.zip.trim()) e.zip = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (!validate()) return
    runPersonalInfo(dispatch, state)
  }

  return (
    <PhoneFrame
      title="Personal Information"
      subtitle="Tell us about yourself"
      onBack={() => dispatch({ type: 'SET_STAGE', stage: 'choose-accounts' })}
      headerAction={<AutoFillToggle enabled={autoFill} onToggle={handleAutoFill} />}
      footer={
        <ActionButton
          onClick={handleSubmit}
          isProcessing={state.isProcessing}
          label="Continue"
        />
      }
    >
      <div className="form-row">
        <FormField label="First Name" error={errors.firstName} required>
          <input className="form-input" value={info.firstName} onChange={(e) => update('firstName', e.target.value)} autoComplete="given-name" />
        </FormField>
        <FormField label="M.I.">
          <input className="form-input" value={info.middleName} onChange={(e) => update('middleName', e.target.value)} autoComplete="additional-name" maxLength={1} />
        </FormField>
      </div>
      <div className="form-row">
        <FormField label="Last Name" error={errors.lastName} required>
          <input className="form-input" value={info.lastName} onChange={(e) => update('lastName', e.target.value)} autoComplete="family-name" />
        </FormField>
        <FormField label="Suffix">
          <input className="form-input" value={info.suffix} onChange={(e) => update('suffix', e.target.value)} autoComplete="honorific-suffix" placeholder="Jr., Sr...." maxLength={10} />
        </FormField>
      </div>
      <FormField label="Tax ID (SSN)" error={errors.tin} required>
        <input className="form-input" value={info.tin} onChange={(e) => update('tin', e.target.value.replace(/[^\d-]/g, ''))} inputMode="numeric" autoComplete="off" spellCheck={false} placeholder="123-45-6789" maxLength={11} />
      </FormField>
      <FormField label="Date of Birth" error={errors.dateOfBirth} required>
        <input className="form-input" type="date" value={info.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} autoComplete="bday" />
      </FormField>
      <FormField label="Country of Legal Residence">
        <select className="form-select" value={info.countryOfLegalResidence} onChange={(e) => update('countryOfLegalResidence', e.target.value)}>
          <option value="USA">United States</option>
        </select>
      </FormField>
      <FormField label="Email Address" error={errors.email} required>
        <input className="form-input" type="email" value={info.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" spellCheck={false} placeholder="you@example.com" />
      </FormField>
      <FormField label="Phone" error={errors.phone} required>
        <input className="form-input" type="tel" value={info.phone} onChange={(e) => update('phone', e.target.value)} autoComplete="tel" inputMode="tel" placeholder="+1 (212) 555-0147" />
      </FormField>
      <FormField label="Legal Address" error={errors.addressLine1} required>
        <input className="form-input" value={info.addressLine1} onChange={(e) => update('addressLine1', e.target.value)} autoComplete="street-address" placeholder="123 Main Street" />
      </FormField>
      <div className="form-row form-row--thirds">
        <FormField label="City" error={errors.city} required>
          <input className="form-input" value={info.city} onChange={(e) => update('city', e.target.value)} autoComplete="address-level2" />
        </FormField>
        <FormField label="State" error={errors.state} required>
          <select className="form-select" value={info.state} onChange={(e) => update('state', e.target.value)} autoComplete="address-level1">
            <option value="">Select...</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Zip" error={errors.zip} required>
          <input className="form-input" value={info.zip} onChange={(e) => update('zip', e.target.value)} autoComplete="postal-code" inputMode="numeric" placeholder="10001" maxLength={10} />
        </FormField>
      </div>
    </PhoneFrame>
  )
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`form-group${error ? ' form-group--error' : ''}`}>
      <label className="form-label">
        {label}
        {required && <span className="form-required" aria-hidden="true">&thinsp;*</span>}
      </label>
      {children}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  )
}

// ─── Step 3: Suitability + KYC ───

function SuitabilityStep({ state, dispatch }: Props) {
  const info = state.suitabilityInfo
  const [errors, setErrors] = useState<Partial<Record<keyof SuitabilityInfo, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [autoFill, setAutoFill] = useState(false)

  const handleAutoFill = (on: boolean) => {
    setAutoFill(on)
    if (on) {
      dispatch({ type: 'SET_SUITABILITY_INFO', info: { ...DEMO_SUITABILITY_INFO } })
      setErrors({})
    }
  }

  const update = (field: keyof SuitabilityInfo, value: string) => {
    dispatch({ type: 'SET_SUITABILITY_INFO', info: { ...info, [field]: value } })
    if (submitted) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof SuitabilityInfo, string>> = {}
    if (!info.employmentType) e.employmentType = 'Required'
    if (!info.investmentObjective) e.investmentObjective = 'Required'
    if (!info.riskTolerance) e.riskTolerance = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (!validate()) return
    runSuitability(dispatch, state)
  }

  if (state.kycStatus === 'verifying') {
    return (
      <PhoneFrame title="Verifying Identity" subtitle="Please wait while we verify your information...">
        <div className="kyc-container">
          <div className="kyc-spinner-ring" />
          <p className="kyc-text">Running KYC checks...</p>
          <div className="kyc-progress-bar">
            <div className="kyc-progress-bar__fill" />
          </div>
        </div>
      </PhoneFrame>
    )
  }

  if (state.kycStatus === 'approved' && state.completedStages.includes('suitability')) {
    return (
      <PhoneFrame
        title="Identity Verified"
        subtitle="Your accounts are ready"
        footer={<SuccessButton label="Approved" />}
      >
        <div className="kyc-container">
          <div className="kyc-approved-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className="kyc-text">KYC verification passed</p>
          {Object.entries(state.accountIds).map(([entitlement, id]) => (
            <div key={entitlement} className="info-card info-card--success">
              <div className="info-card__label">{entitlement.replace(/_/g, ' ')}</div>
              <div className="info-card__value info-card__value--mono">{id}</div>
            </div>
          ))}
        </div>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame
      title="Investment Profile"
      subtitle="Required for regulatory compliance"
      onBack={() => dispatch({ type: 'SET_STAGE', stage: 'personal-info' })}
      headerAction={<AutoFillToggle enabled={autoFill} onToggle={handleAutoFill} />}
      footer={
        <ActionButton
          onClick={handleSubmit}
          isProcessing={state.isProcessing}
          label="Submit &amp; Verify"
        />
      }
    >
      <FormField label="Employment Type" error={errors.employmentType} required>
        <select className="form-select" value={info.employmentType} onChange={(e) => update('employmentType', e.target.value)}>
          <option value="">Select...</option>
          {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </FormField>
      <FormField label="Occupation">
        <input className="form-input" value={info.occupation} onChange={(e) => update('occupation', e.target.value)} placeholder="e.g., Software Engineer" />
      </FormField>
      <FormField label="Type of Business">
        <select className="form-select" value={info.typeOfBusiness} onChange={(e) => update('typeOfBusiness', e.target.value)}>
          <option value="">Select...</option>
          {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </FormField>
      <FormField label="Employer">
        <input className="form-input" value={info.employer} onChange={(e) => update('employer', e.target.value)} placeholder="e.g., Acme Corporation" />
      </FormField>
      <FormField label="Business Phone">
        <input className="form-input" type="tel" value={info.businessPhone} onChange={(e) => update('businessPhone', e.target.value)} inputMode="tel" placeholder="+1 (555) 000-0000" />
      </FormField>
      <FormField label="Business Address">
        <input className="form-input" value={info.businessAddress} onChange={(e) => update('businessAddress', e.target.value)} placeholder="123 Business Blvd" />
      </FormField>
      <div className="form-row">
        <FormField label="Liquid Net Worth">
          <select className="form-select" value={info.liquidNetWorth} onChange={(e) => update('liquidNetWorth', e.target.value)}>
            <option value="">Select...</option>
            {NET_WORTH_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </FormField>
        <FormField label="Total Net Worth">
          <select className="form-select" value={info.totalNetWorth} onChange={(e) => update('totalNetWorth', e.target.value)}>
            <option value="">Select...</option>
            {NET_WORTH_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Investment Objective" error={errors.investmentObjective} required>
        <select className="form-select" value={info.investmentObjective} onChange={(e) => update('investmentObjective', e.target.value)}>
          <option value="">Select...</option>
          {INVESTMENT_OBJECTIVES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </FormField>
      <FormField label="Risk Tolerance" error={errors.riskTolerance} required>
        <select className="form-select" value={info.riskTolerance} onChange={(e) => update('riskTolerance', e.target.value)}>
          <option value="">Select...</option>
          {RISK_TOLERANCES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </FormField>
    </PhoneFrame>
  )
}

// ─── Step 4: Deposit ───

function DepositStep({ state, dispatch }: Props) {
  const [amount, setAmount] = useState(DEPOSIT_AMOUNT)
  const isCompleted = state.completedStages.includes('deposit-funds')

  const handleDeposit = () => {
    runDeposit(dispatch, state, amount)
  }

  return (
    <PhoneFrame
      title="Fund Account"
      subtitle="Deposit funds via ACH transfer"
      footer={
        isCompleted
          ? <SuccessButton label="Deposit Complete" />
          : (
            <ActionButton
              onClick={handleDeposit}
              isProcessing={state.isProcessing}
              label={`Deposit $${amount}`}
            />
          )
      }
    >
      <div className="info-card">
        <div className="info-card__label">From</div>
        <div className="info-card__value">{MOCK_BANK.bankName}</div>
        <div className="info-card__detail">Checking {MOCK_BANK.maskedIdentifier}</div>
      </div>
      <div className="info-card">
        <div className="info-card__label">To</div>
        <div className="info-card__value">
          {state.personalInfo.firstName} {state.personalInfo.lastName}
        </div>
        <div className="info-card__detail info-card__detail--mono">
          {Object.values(state.accountIds)[0]}
        </div>
      </div>
      <FormField label="Deposit Amount">
        <div className="deposit-amount-input">
          <span className="deposit-amount-input__prefix">$</span>
          <input
            className="form-input deposit-amount-input__field"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            disabled={isCompleted}
          />
        </div>
      </FormField>
      {isCompleted && state.balance && (
        <div className="info-card info-card--success">
          <div className="info-card__label">Available Balance</div>
          <div className="info-card__value info-card__value--large">${state.balance}</div>
        </div>
      )}
    </PhoneFrame>
  )
}

// ─── News Feed Step (News Reel mode) ───

function NewsFeedStep({ state, dispatch }: Props) {
  return (
    <div className="news-feed">
      <div className="news-feed__container">
        <img
          className="news-feed__gif"
          src="/news-reel.gif"
          alt="Breaking news: Godzilla attacks oil tankers, oil prices surge"
        />
        <button
          className="news-feed__qr-hotspot"
          onClick={() => runNewsFeedScan(dispatch)}
          disabled={state.isProcessing}
          type="button"
          aria-label="Scan QR code to open an Event Contracts account"
        >
          {state.isProcessing && <span className="spinner" aria-hidden="true" />}
          <span className="news-feed__qr-hint">Tap to scan</span>
        </button>
      </div>
    </div>
  )
}

// ─── Step 5: Explore Markets ───

type SelectedAsset =
  | { kind: 'stock'; symbol: string; name: string; price: string; color: string }
  | { kind: 'event'; id: string; question: string; side: 'yes' | 'no'; price: string; category: string }

type OrderMode = 'dollars' | 'shares' | 'contracts'

function OrderEntryPanel({
  asset,
  balance,
  isProcessing,
  onCancel,
  onSubmit,
}: {
  asset: SelectedAsset
  balance: string
  isProcessing: boolean
  onCancel: () => void
  onSubmit: (sizing: OrderSizing) => void
}) {
  const isEquity = asset.kind === 'stock'
  const altMode: OrderMode = isEquity ? 'shares' : 'contracts'
  const [mode, setMode] = useState<OrderMode>('dollars')
  const [amount, setAmount] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const mql = window.matchMedia('(pointer: fine)')
    if (mql.matches) inputRef.current?.focus()
  }, [])

  const price = parseFloat(asset.price)
  const amountNum = parseFloat(amount) || 0
  const balanceNum = parseFloat(balance)

  let estimatedCost: number
  let estimateLabel: string

  if (mode === 'dollars') {
    const qty = amountNum / price
    estimatedCost = amountNum
    if (isEquity) {
      estimateLabel = `~${qty.toFixed(4)}\u00A0shares`
    } else {
      estimateLabel = `~${Math.floor(qty)}\u00A0contracts`
    }
  } else {
    estimatedCost = amountNum * price
    estimateLabel = `~$${estimatedCost.toFixed(2)} est.\u00A0cost`
  }

  const exceedsBalance = amountNum > 0 && estimatedCost > balanceNum
  const isValid = amountNum > 0 && !exceedsBalance
  const symbol = asset.kind === 'stock' ? asset.symbol : asset.id
  const label = asset.kind === 'stock'
    ? asset.symbol
    : `${asset.side === 'yes' ? 'Yes' : 'No'} @ $${asset.price}`

  const handleAmountChange = (raw: string) => {
    if (mode === 'contracts') {
      setAmount(raw.replace(/[^\d]/g, ''))
    } else {
      setAmount(raw.replace(/[^\d.]/g, ''))
    }
  }

  const handleSubmit = () => {
    if (!isValid) return
    if (mode === 'dollars') {
      onSubmit({ mode: 'notional', value: parseFloat(amount).toFixed(2) })
    } else {
      const val = mode === 'contracts'
        ? String(Math.floor(amountNum))
        : parseFloat(amount).toFixed(6)
      onSubmit({ mode: 'quantity', value: val })
    }
  }

  return (
    <div className="order-panel" role="dialog" aria-label={`Buy ${symbol}`}>
      <div className="order-panel__header">
        {asset.kind === 'stock' && (
          <div className="order-panel__asset">
            <div className="stock-card__icon stock-card__icon--sm" style={{ background: asset.color }}>
              {asset.symbol[0]}
            </div>
            <div>
              <div className="order-panel__symbol">{asset.symbol}</div>
              <div className="order-panel__name">{asset.name}</div>
            </div>
            <div className="order-panel__price">${asset.price}</div>
          </div>
        )}
        {asset.kind === 'event' && (
          <div className="order-panel__asset">
            <div className={`order-panel__side-badge order-panel__side-badge--${asset.side}`}>
              {asset.side === 'yes' ? 'Yes' : 'No'}
            </div>
            <div>
              <div className="order-panel__symbol">{asset.question}</div>
              <div className="order-panel__name">{asset.category}</div>
            </div>
            <div className="order-panel__price">${asset.price}</div>
          </div>
        )}
      </div>

      <div className="order-panel__toggle" role="radiogroup" aria-label="Order type">
        <button
          className={`order-panel__toggle-btn${mode === 'dollars' ? ' order-panel__toggle-btn--active' : ''}`}
          onClick={() => { setMode('dollars'); setAmount('') }}
          role="radio"
          aria-checked={mode === 'dollars'}
          type="button"
        >
          Dollars
        </button>
        <button
          className={`order-panel__toggle-btn${mode === altMode ? ' order-panel__toggle-btn--active' : ''}`}
          onClick={() => { setMode(altMode); setAmount('') }}
          role="radio"
          aria-checked={mode === altMode}
          type="button"
        >
          {isEquity ? 'Shares' : 'Contracts'}
        </button>
      </div>

      <div className="order-panel__input-group">
        <label className="order-panel__input-label" htmlFor="order-amount">
          {mode === 'dollars' ? 'Amount' : isEquity ? 'Number of shares' : 'Number of contracts'}
        </label>
        <div className="order-panel__input-wrap">
          {mode === 'dollars' && <span className="order-panel__input-prefix">$</span>}
          <input
            ref={inputRef}
            id="order-amount"
            className="form-input order-panel__input"
            type="text"
            inputMode={mode === 'contracts' ? 'numeric' : 'decimal'}
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={mode === 'dollars' ? '0.00' : mode === 'shares' ? '0.0000' : '0'}
            autoComplete="off"
            spellCheck={false}
            disabled={isProcessing}
          />
          {mode !== 'dollars' && (
            <span className="order-panel__input-suffix">
              {isEquity ? 'shares' : 'contracts'}
            </span>
          )}
        </div>
      </div>

      {amountNum > 0 && (
        <div className="order-panel__estimate" aria-live="polite">
          <span className="order-panel__estimate-label">Est.</span>
          <span className="order-panel__estimate-value">{estimateLabel}</span>
        </div>
      )}

      {exceedsBalance && (
        <div className="order-panel__warning" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Exceeds available balance (${ balanceNum.toFixed(2)})
        </div>
      )}

      <div className="order-panel__actions">
        <button
          className="order-panel__cancel"
          onClick={onCancel}
          disabled={isProcessing}
          type="button"
        >
          Cancel
        </button>
        <button
          className="order-panel__buy"
          onClick={handleSubmit}
          disabled={!isValid || isProcessing}
          type="button"
        >
          {isProcessing && <span className="spinner spinner--sm" aria-hidden="true" />}
          {isProcessing ? 'Placing\u2026' : `Buy ${label}`}
        </button>
      </div>
    </div>
  )
}

function ExploreMarketsStep({ state, dispatch, demoMode }: Props) {
  const isNewsReel = demoMode === 'news-reel'
  const hasEventContracts = isNewsReel || state.selectedAccountTypes.includes('EVENT_CONTRACTS')
  const hasStocks = !isNewsReel && (state.selectedAccountTypes.includes('FINTECH_RETAIL') || state.selectedAccountTypes.includes('CRYPTO'))
  const defaultTab = hasStocks ? 'stocks' : 'events'
  const [activeTab, setActiveTab] = useState<'stocks' | 'events'>(defaultTab)
  const [filledOrders, setFilledOrders] = useState<string[]>([])
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)

  const handleOpenStock = (stock: typeof STOCK_LIST[number]) => {
    if (filledOrders.includes(stock.symbol)) return
    setSelectedAsset({ kind: 'stock', symbol: stock.symbol, name: stock.name, price: stock.price, color: stock.color })
  }

  const handleOpenEvent = (ec: typeof EVENT_CONTRACTS_LIST[number], side: 'yes' | 'no') => {
    if (filledOrders.includes(ec.id)) return
    setSelectedAsset({
      kind: 'event',
      id: ec.id,
      question: ec.question,
      side,
      price: side === 'yes' ? ec.yesPrice : ec.noPrice,
      category: ec.category,
    })
  }

  const handlePlaceOrder = async (sizing: OrderSizing) => {
    if (!selectedAsset) return
    const id = selectedAsset.kind === 'stock' ? selectedAsset.symbol : selectedAsset.id
    setBuyingId(id)
    const assetClass = selectedAsset.kind === 'event' ? 'EVENT_CONTRACT' as const : 'EQUITY' as const
    const symbol = selectedAsset.kind === 'stock' ? selectedAsset.symbol : selectedAsset.id
    await runPlaceOrder(dispatch, state, symbol, selectedAsset.price, sizing, assetClass)
    setFilledOrders((prev) => [...prev, id])
    setBuyingId(null)
    setSelectedAsset(null)
  }

  if (selectedAsset) {
    return (
      <PhoneFrame
        title="Place Order"
        subtitle={`Available: $${state.balance || '0.00'}`}
      >
        <OrderEntryPanel
          asset={selectedAsset}
          balance={state.balance || '0.00'}
          isProcessing={!!buyingId}
          onCancel={() => setSelectedAsset(null)}
          onSubmit={handlePlaceOrder}
        />
      </PhoneFrame>
    )
  }

  const hasTransactions = state.transactions.length > 0

  return (
    <PhoneFrame
      title="Explore Markets"
      subtitle={`Available: $${state.balance || '0.00'}`}
      footer={hasTransactions ? (
        <button
          className="action-btn action-btn--secondary"
          onClick={() => dispatch({ type: 'SET_STAGE', stage: 'transaction-history' })}
          type="button"
        >
          View Transaction History
        </button>
      ) : undefined}
    >
      {(hasStocks && hasEventContracts) && (
        <div className="tab-bar" role="tablist">
          <button
            className={`tab-bar__tab${activeTab === 'stocks' ? ' tab-bar__tab--active' : ''}`}
            onClick={() => setActiveTab('stocks')}
            role="tab"
            aria-selected={activeTab === 'stocks'}
            type="button"
          >
            Stocks
          </button>
          <button
            className={`tab-bar__tab${activeTab === 'events' ? ' tab-bar__tab--active' : ''}`}
            onClick={() => setActiveTab('events')}
            role="tab"
            aria-selected={activeTab === 'events'}
            type="button"
          >
            Event Contracts
          </button>
        </div>
      )}

      {activeTab === 'stocks' && (
        <div className="market-list">
          {STOCK_LIST.map((stock, i) => {
            const isFilled = filledOrders.includes(stock.symbol)
            const isPositive = stock.change.startsWith('+')
            return (
              <div key={stock.symbol} className="stock-card" style={{ '--i': i } as React.CSSProperties}>
                <div className="stock-card__left">
                  <div className="stock-card__icon" style={{ background: stock.color }}>
                    {stock.symbol[0]}
                  </div>
                  <div>
                    <div className="stock-card__symbol">{stock.symbol}</div>
                    <div className="stock-card__name">{stock.name}</div>
                  </div>
                </div>
                <div className="stock-card__right">
                  <div className="stock-card__price">${stock.price}</div>
                  <div className={`stock-card__change${isPositive ? ' stock-card__change--up' : ' stock-card__change--down'}`}>
                    {stock.change} ({stock.changePercent})
                  </div>
                </div>
                <button
                  className={`stock-card__buy${isFilled ? ' stock-card__buy--filled' : ''}`}
                  onClick={() => handleOpenStock(stock)}
                  disabled={state.isProcessing || isFilled}
                  type="button"
                >
                  {isFilled ? 'Filled' : 'Buy'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="market-list">
          {(isNewsReel ? [OIL_EVENT_CONTRACT] : EVENT_CONTRACTS_LIST).map((ec, i) => {
            const isFilled = filledOrders.includes(ec.id)
            return (
              <div key={ec.id} className="event-card" style={{ '--i': i } as React.CSSProperties}>
                <div className="event-card__question">{ec.question}</div>
                <div className="event-card__meta">
                  <span className="event-card__category">{ec.category}</span>
                  <span className="event-card__expires">Expires {ec.expiresAt}</span>
                </div>
                <div className="event-card__prices">
                  <button
                    className={`event-card__btn event-card__btn--yes${isFilled ? ' event-card__btn--filled' : ''}`}
                    onClick={() => handleOpenEvent(ec, 'yes')}
                    disabled={state.isProcessing || isFilled}
                    type="button"
                  >
                    Yes ${ec.yesPrice}
                  </button>
                  <button
                    className={`event-card__btn event-card__btn--no${isFilled ? ' event-card__btn--filled' : ''}`}
                    onClick={() => handleOpenEvent(ec, 'no')}
                    disabled={state.isProcessing || isFilled}
                    type="button"
                  >
                    No ${ec.noPrice}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PhoneFrame>
  )
}

// ─── Step 7: Transaction History ───

const TX_TYPE_LABELS: Record<string, string> = {
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  DIVIDEND: 'Dividend',
  MARKET_BUY: 'Market Buy',
  MARKET_SELL: 'Market Sell',
  LIMIT_BUY: 'Limit Buy',
  LIMIT_SELL: 'Limit Sell',
}

function formatTxDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    + '\u00A0\u00B7\u00A0'
    + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isTrade = isTradeTransaction(tx)
  const typeLabel = TX_TYPE_LABELS[tx.type] ?? tx.type
  const isDebit = tx.type === 'MARKET_BUY' || tx.type === 'LIMIT_BUY' || tx.type === 'WITHDRAWAL'

  let amountDisplay: string
  if (isTrade) {
    const cost = (parseFloat(tx.filledQuantity) * parseFloat(tx.averagePrice)).toFixed(2)
    amountDisplay = `${isDebit ? '\u2212' : '+'}$${cost}`
  } else {
    amountDisplay = `${tx.type === 'WITHDRAWAL' ? '\u2212' : '+'}$${tx.amount}`
  }

  return (
    <div className="tx-row">
      <div className="tx-row__icon" aria-hidden="true">
        {isTrade ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <polyline points="5 16 12 23 19 16" />
          </svg>
        )}
      </div>
      <div className="tx-row__details">
        <div className="tx-row__primary">
          <span className="tx-row__type">{typeLabel}</span>
          {isTrade && (
            <span className="tx-row__symbol">{tx.instrumentIdentifiers.symbol}</span>
          )}
        </div>
        <div className="tx-row__secondary">
          <span className="tx-row__date">{formatTxDate(tx.submittedDate)}</span>
          {isTrade && (
            <span className="tx-row__qty">
              {tx.filledQuantity}\u00A0{parseFloat(tx.filledQuantity) === 1 ? 'share' : 'shares'} @ ${tx.averagePrice}
            </span>
          )}
        </div>
      </div>
      <div className="tx-row__right">
        <span className={`tx-row__amount ${isDebit ? 'tx-row__amount--debit' : 'tx-row__amount--credit'}`}>
          {amountDisplay}
        </span>
        <span className={`tx-row__status tx-row__status--${tx.status.toLowerCase()}`}>
          {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
        </span>
      </div>
    </div>
  )
}

function TransactionHistoryStep({ state, dispatch }: Props) {
  const hasTransactions = state.transactions.length > 0
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!hasFetched.current && hasTransactions) {
      hasFetched.current = true
      runViewTransactions(dispatch, state)
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const sortedTransactions = [...state.transactions].reverse()

  return (
    <PhoneFrame
      title="Transaction History"
      subtitle={hasTransactions ? `${state.transactions.length} transaction${state.transactions.length !== 1 ? 's' : ''}` : undefined}
      onBack={() => dispatch({ type: 'SET_STAGE', stage: 'explore-markets' })}
      footer={
        hasTransactions ? (
          <button
            className="action-btn"
            onClick={() => dispatch({ type: 'SET_STAGE', stage: 'explore-markets' })}
            type="button"
          >
            Back to Markets
          </button>
        ) : undefined
      }
    >
      {!hasTransactions ? (
        <div className="tx-empty">
          <div className="tx-empty__icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <p className="tx-empty__title">No transactions yet</p>
          <p className="tx-empty__desc">
            Deposit funds and place trades to see your history here.
          </p>
        </div>
      ) : (
        <div className="tx-list" role="list" aria-label="Transaction history">
          {sortedTransactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </PhoneFrame>
  )
}

// ─── Router ───

export function AppSurface({ state, dispatch, demoMode = 'mobile-app' }: Props) {
  const { currentStage } = state

  return (
    <section className="app-surface" id="app-surface" aria-label="Consumer app" tabIndex={-1}>
      {currentStage === 'demo-setup' && <DemoSetupStep state={state} dispatch={dispatch} demoMode={demoMode} />}
      {currentStage === 'choose-accounts' && <ChooseAccountsStep state={state} dispatch={dispatch} />}
      {currentStage === 'news-feed' && <NewsFeedStep state={state} dispatch={dispatch} />}
      {currentStage === 'news-reel-disclosure' && <NewsReelDisclosureStep state={state} dispatch={dispatch} />}
      {currentStage === 'personal-info' && <PersonalInfoStep state={state} dispatch={dispatch} />}
      {currentStage === 'suitability' && <SuitabilityStep state={state} dispatch={dispatch} />}
      {currentStage === 'deposit-funds' && <DepositStep state={state} dispatch={dispatch} />}
      {currentStage === 'explore-markets' && <ExploreMarketsStep state={state} dispatch={dispatch} demoMode={demoMode} />}
      {currentStage === 'transaction-history' && <TransactionHistoryStep state={state} dispatch={dispatch} />}
    </section>
  )
}
