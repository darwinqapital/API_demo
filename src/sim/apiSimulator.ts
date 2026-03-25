import type { ApiLogEntry, DemoStage, PersonalInfo, SuitabilityInfo, AccountTypeChoice, Transaction } from '../types/wedbush'
import { isTradeTransaction } from '../types/wedbush'
import { uuid, MOCK_BANK, DEPOSIT_AMOUNT } from '../data/mockSeeds'

let logCounter = 0

function makeLog(
  stageId: DemoStage,
  method: ApiLogEntry['method'],
  path: string,
  description: string,
  statusCode: number,
  requestBody: unknown,
  responseBody: unknown,
  durationMs: number,
): ApiLogEntry {
  return {
    id: `log-${++logCounter}`,
    stageId,
    method,
    path,
    description,
    requestBody,
    responseBody,
    statusCode,
    timestamp: Date.now(),
    durationMs,
  }
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

function maskTin(tin: string): string {
  if (tin.length >= 4) return '***-**-' + tin.slice(-4)
  return tin
}

const ENTITLEMENT_LABELS: Record<AccountTypeChoice, string> = {
  EVENT_CONTRACTS: 'Event Contracts',
  FINTECH_RETAIL: 'Investing',
  CRYPTO: 'Crypto Trading',
}

// Step 1: Authenticate
export async function simulateAuth(
  addLog: (entry: ApiLogEntry) => void,
) {
  const tokenReq = { grant_type: 'client_credentials' }
  const token = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: 'partner-app', exp: Date.now() + 3600000 }))}.mock-signature`

  await delay(400)
  addLog(makeLog('choose-accounts', 'POST', '/v1/auth/token', 'Authenticate with OAuth 2.0 client credentials', 200, tokenReq, {
    access_token: token,
    token_type: 'Bearer',
    expires_in: 3600,
  }, 142))

  return { token }
}

// Step 2: Create Client
export async function simulateCreateClient(
  addLog: (entry: ApiLogEntry) => void,
  personalInfo: PersonalInfo,
) {
  const clientId = uuid()
  const clientReq = {
    data: {
      clientType: 'INDIVIDUAL',
      subFirmNumber: 1,
      externalId: `EXT-${uuid().slice(0, 8).toUpperCase()}`,
      personalInformation: {
        firstName: personalInfo.firstName,
        middleName: personalInfo.middleName || null,
        lastName: personalInfo.lastName,
        suffix: personalInfo.suffix || null,
        dateOfBirth: personalInfo.dateOfBirth,
        countryOfLegalResidence: personalInfo.countryOfLegalResidence,
      },
      identificationInformation: {
        identifications: [{
          externalSyncId: `id-${uuid().slice(0, 6)}`,
          type: 'SSN',
          value: personalInfo.tin,
          roles: ['TAX_REPORTING'],
        }],
      },
      personalContactsInformation: {
        emails: [{
          externalSyncId: `email-${uuid().slice(0, 6)}`,
          email: personalInfo.email,
          type: 'PERSONAL',
          roles: ['PRIMARY', 'STATEMENTS'],
        }],
        phones: [{
          externalSyncId: `phone-${uuid().slice(0, 6)}`,
          countryCode: '+1',
          phoneNumber: personalInfo.phone.replace(/\D/g, '').slice(-10),
          type: 'MOBILE',
          roles: ['PRIMARY'],
        }],
        addresses: [{
          externalSyncId: `addr-${uuid().slice(0, 6)}`,
          line1: personalInfo.addressLine1,
          city: personalInfo.city,
          region: personalInfo.state,
          postalCode: personalInfo.zip,
          type: 'LEGAL',
          roles: ['PRIMARY', 'TAX_REPORTING'],
        }],
      },
    },
    meta: {},
  }

  await delay(600)
  addLog(makeLog('personal-info', 'POST', '/v2/clients', 'Create client profile with personal and contact information', 201, clientReq, {
    data: {
      clientId,
      clientType: 'INDIVIDUAL',
      status: 'ACTIVE',
      personalInformation: {
        ...clientReq.data.personalInformation,
        identificationInformation: {
          identifications: [{ type: 'SSN', value: maskTin(personalInfo.tin), roles: ['TAX_REPORTING'] }],
        },
      },
    },
    meta: { requestId: uuid() },
  }, 287))

  return { clientId }
}

// Step 3: Update suitability + KYC + create accounts
export async function simulateUpdateSuitability(
  addLog: (entry: ApiLogEntry) => void,
  clientId: string,
  suitability: SuitabilityInfo,
) {
  const updateReq = {
    data: {
      workInformation: {
        employmentType: suitability.employmentType,
        occupation: suitability.occupation,
        typeOfBusiness: suitability.typeOfBusiness,
      },
      employerInformation: {
        employer: suitability.employer,
        isEmployerABroker: false,
      },
      financialInformation: {
        liquidNetWorth: parseInt(suitability.liquidNetWorth) || 0,
        totalNetWorth: parseInt(suitability.totalNetWorth) || 0,
      },
    },
    meta: {},
  }

  await delay(500)
  addLog(makeLog('suitability', 'PATCH', `/v2/clients/${clientId}`, 'Update client with suitability and employment information', 200, updateReq, {
    data: {
      clientId,
      status: 'ACTIVE',
      workInformation: updateReq.data.workInformation,
      financialInformation: updateReq.data.financialInformation,
    },
    meta: { requestId: uuid() },
  }, 215))
}

export async function simulateCreateAccounts(
  addLog: (entry: ApiLogEntry) => void,
  clientId: string,
  accountTypes: AccountTypeChoice[],
  investmentObjective: string,
  riskTolerance: string,
) {
  const results: Record<string, string> = {}

  for (const entitlement of accountTypes) {
    const accountId = uuid()
    const accountName = `${ENTITLEMENT_LABELS[entitlement]} Account`
    const accountReq = {
      data: {
        clientId,
        name: accountName,
        accountType: 'INDIVIDUAL',
        accountStatus: 'OPEN',
        entitlements: [entitlement],
        leverageType: 'CASH',
        investmentProfile: {
          primaryObjective: investmentObjective || 'GROWTH',
          riskTolerance: riskTolerance || 'MODERATE',
        },
      },
      meta: {},
    }

    await delay(450)
    addLog(makeLog('suitability', 'POST', '/v2/accounts', `Open ${accountName} with ${entitlement} entitlement`, 201, accountReq, {
      data: {
        accountId,
        accountNumber: `WB${String(Math.floor(Math.random() * 99999999)).padStart(8, '0')}`,
        clientId,
        name: accountName,
        accountType: 'INDIVIDUAL',
        accountHolderType: 'I',
        accountStatus: 'OPEN',
        entitlements: [entitlement],
        leverageType: 'CASH',
      },
      meta: {},
    }, 341))

    results[entitlement] = accountId
  }

  return results
}

// Step 4: Deposit Funds
export async function simulateDepositFunds(
  addLog: (entry: ApiLogEntry) => void,
  clientId: string,
  accountId: string,
  personalInfo: PersonalInfo,
  depositAmount: string,
) {
  const paymentAccountId = uuid()
  const holderName = [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(' ')
  const linkReq = {
    data: {
      clientId,
      currency: 'USD',
      country: 'USA',
      maskedIdentifier: MOCK_BANK.maskedIdentifier,
      nickname: `${MOCK_BANK.bankName} Checking`,
      details: {
        type: 'BANK_ACCOUNT',
        accountHolderName: holderName,
        accountType: MOCK_BANK.accountType,
        bankName: MOCK_BANK.bankName,
        bankIdentifierType: 'ABA_ROUTING',
        bankIdentifier: MOCK_BANK.routingNumber,
      },
    },
    meta: {},
  }

  await delay(450)
  addLog(makeLog('deposit-funds', 'POST', '/v1/payments/payment-accounts', 'Link external bank account for ACH transfers', 201, linkReq, {
    data: {
      paymentAccountId,
      status: 'LINKED',
      currency: 'USD',
      country: 'USA',
      maskedIdentifier: MOCK_BANK.maskedIdentifier,
      nickname: `${MOCK_BANK.bankName} Checking`,
      createdAt: new Date().toISOString(),
      details: linkReq.data.details,
    },
    meta: null,
  }, 198))

  const instructionId = uuid()
  const instrReq = {
    data: {
      transferType: 'ACH',
      orchestrationMode: 'SYSTEM_PROCESSOR',
      sourceAccount: { id: paymentAccountId, type: 'PAYMENT' },
      destinationAccount: { id: accountId, type: 'CLIENT' },
      destinationCurrency: 'USD',
      destinationAmount: depositAmount,
      description: 'Initial deposit',
    },
    meta: {},
  }

  await delay(550)
  addLog(makeLog('deposit-funds', 'POST', '/v1/payments/payment-instructions', 'Create ACH deposit instruction into brokerage account', 201, instrReq, {
    data: {
      id: instructionId,
      transferType: 'ACH',
      orchestrationMode: 'SYSTEM_PROCESSOR',
      status: 'COMPLETED',
      sourceAccount: instrReq.data.sourceAccount,
      destinationAccount: instrReq.data.destinationAccount,
      sourceCurrency: 'USD',
      sourceAmount: depositAmount,
      destinationCurrency: 'USD',
      destinationAmount: depositAmount,
      createdAt: new Date().toISOString(),
    },
    meta: null,
  }, 412))

  await delay(300)
  addLog(makeLog('deposit-funds', 'GET', `/v1/accounts/${accountId}/balances`, 'Retrieve updated account balances', 200, undefined, {
    data: {
      accountId,
      accountValue: depositAmount,
      accountCurrency: 'USD',
      portfolioValue: '0.00',
      totalInvestedValue: '0.00',
      availableMargin: '0.00',
      buyingPower: depositAmount,
      cashAvailableForWithdrawal: depositAmount,
      unavailableBalance: '0.00',
    },
    meta: {},
  }, 87))

  return { paymentAccountId, balance: depositAmount }
}

// Step 5: Place Order
export interface OrderSizing {
  mode: 'notional' | 'quantity'
  value: string
}

export async function simulatePlaceOrder(
  addLog: (entry: ApiLogEntry) => void,
  accountId: string,
  symbol: string,
  price: string,
  sizing: OrderSizing,
  assetClass: 'EQUITY' | 'EVENT_CONTRACT' = 'EQUITY',
) {
  const orderId = uuid()
  const priceNum = parseFloat(price)

  let fillQuantity: string
  let fillCost: string
  let description: string

  if (sizing.mode === 'notional') {
    fillQuantity = (parseFloat(sizing.value) / priceNum).toFixed(6)
    fillCost = sizing.value
    description = `Place $${sizing.value} market buy order for ${symbol}`
  } else {
    fillQuantity = sizing.value
    fillCost = (parseFloat(sizing.value) * priceNum).toFixed(2)
    description = `Place market buy order for ${sizing.value} ${assetClass === 'EVENT_CONTRACT' ? 'contracts' : 'shares'} of ${symbol}`
  }

  const sizingField = sizing.mode === 'notional'
    ? { notionalAmount: sizing.value }
    : { quantity: sizing.value }

  const orderReq = {
    data: {
      accountID: accountId,
      assetIdentifier: symbol,
      assetIdentifierType: 'SYMBOL',
      assetClass,
      side: 'BUY',
      orderType: 'MARKET',
      timeInForce: 'DAY',
      ...sizingField,
    },
    meta: {},
  }

  await delay(700)
  addLog(makeLog('explore-markets', 'POST', '/v1/orders', description, 201, orderReq, {
    data: {
      status: 'FILLED',
      orderId,
      externalId: null,
      fillPrice: price,
      fillQuantity,
      fillCost,
      filledAt: new Date().toISOString(),
    },
    meta: {},
  }, 523))

  return { orderId, price, shares: fillQuantity, cost: fillCost }
}

// Step 7: Get Transactions
export async function simulateGetTransactions(
  addLog: (entry: ApiLogEntry) => void,
  accountId: string,
  transactions: Transaction[],
) {
  const wtsTransactions = transactions.map((tx) => {
    if (!isTradeTransaction(tx)) {
      return {
        submittedDate: tx.submittedDate,
        completedDate: tx.completedDate,
        status: tx.status,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
      }
    }
    return {
      submittedDate: tx.submittedDate,
      completedDate: tx.completedDate,
      status: tx.status,
      type: tx.type,
      instrumentIdentifiers: tx.instrumentIdentifiers,
      enteredQuantity: tx.enteredQuantity,
      filledQuantity: tx.filledQuantity,
      averagePrice: tx.averagePrice,
      currency: tx.currency,
    }
  })

  await delay(350)
  addLog(makeLog('transaction-history', 'GET', `/v1/accounts/${accountId}/transactions`, 'Retrieve paginated transaction history for account', 200, undefined, {
    data: {
      accountId,
      transactions: wtsTransactions,
    },
    meta: {
      pagination: {
        page: 1,
        limit: 25,
        total: transactions.length,
        totalPages: 1,
      },
    },
  }, 124))
}
