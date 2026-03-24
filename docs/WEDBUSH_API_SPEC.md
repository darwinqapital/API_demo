# Wedbush Technology Solutions -- API Reference (Demo Endpoints)

> Comprehensive specification for the 7 endpoints used in the demo flow.
> Source: [wedbush-tech.readme.io](https://wedbush-tech.readme.io/reference/createorderv1)

---

## Table of Contents

1. [Authentication -- Request OAuth 2.0 Access Token](#1-request-oauth-20-access-token)
2. [Onboarding -- Create Client](#2-create-client)
3. [Onboarding -- Create Account](#3-create-account)
4. [Payments -- Link Payment Account](#4-link-payment-account)
5. [Payments -- Create Payment Instruction](#5-create-payment-instruction)
6. [Account Financials -- Get Balances](#6-get-balances-by-account-id)
7. [Trading -- Create New Order](#7-create-new-order)

---

## Common Conventions

| Convention | Detail |
|---|---|
| **Base URL** | `https://bo-api.staging.wedbush.tech` |
| **Auth** | Bearer JWT on all endpoints except `/v1/auth/token` which uses HTTP Basic |
| **Envelope** | All request/response bodies use `{ "data": ..., "meta": ... }` |
| **IDs** | UUID v7 format (e.g. `018f3f95-6b27-7c5f-bcf5-2b7f5a1a4d2e`) |
| **Monetary values** | Decimal strings with 2-digit precision (e.g. `"100.00"`) |
| **Idempotency** | Optional `idempotency-key` header (1-255 chars, `[a-zA-Z0-9\-_:.]`). Recommended: UUID v4. |
| **Error envelope** | `{ "errors": [{ "code": "...", "title": "...", "detail": "..." }], "meta": {} }` |

### Standard Error Schema -- ApiErrorResponseEnvelopeDto

```json
{
  "errors": [
    {
      "code": "INSUFFICIENT_FUNDS",       // UPPER_SNAKE_CASE, required
      "title": "Insufficient Funds",      // human-readable, required
      "detail": "Account balance of $1,250.00 is insufficient for trade amount of $5,000.00"
    }
  ],
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 1. Request OAuth 2.0 Access Token

| | |
|---|---|
| **Endpoint** | `POST /v1/auth/token` |
| **operationId** | `AuthJWTController_token` |
| **Auth** | HTTP Basic (OAuth client ID : client secret) |
| **Tags** | Authorization |

Issues a short-lived Bearer token using the `client_credentials` grant. Only `client_credentials` is supported.

### Request

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Basic base64(clientId:clientSecret)` |
| `Content-Type` | `application/json` |

**Body**

```json
{
  "grant_type": "client_credentials"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `grant_type` | `string` | Yes | Must be `"client_credentials"` |

### Response `200 OK`

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

| Field | Type | Description |
|---|---|---|
| `access_token` | `string` | JWT Bearer token |
| `token_type` | `string` | Always `"Bearer"` |
| `expires_in` | `integer` | Token lifetime in seconds |

### Error Responses

| Status | Meaning |
|---|---|
| `400` | Unsupported or missing `grant_type` |
| `401` | Invalid or missing OAuth client credentials |
| `403` | Forbidden |
| `404` | Not found |

---

## 2. Create Client

| | |
|---|---|
| **Endpoint** | `POST /v2/clients` |
| **operationId** | `ClientsV2Controller_createClient` |
| **Auth** | Bearer JWT |
| **Tags** | Clients v2 |

Creates a client (person) with personal information, identification, contacts, and optionally all suitability data needed to open an account in the same call.

### Request

**Headers**

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer {token}` |
| `idempotency-key` | No | UUID v4 recommended |

**Body -- CreateClientsRequestV3Dto**

```json
{
  "data": {
    "clientType": "INDIVIDUAL",
    "subFirmNumber": 1,
    "externalId": "EXT-CLIENT-12345",

    "personalInformation": {
      "firstName": "John",
      "middleName": "Michael",
      "lastName": "Doe",
      "suffix": "Jr.",
      "dateOfBirth": "1990-01-15",
      "countryOfLegalResidence": "USA",
      "countryOfCitizenship": "USA",
      "countryOfTaxResidence": "USA",
      "gender": "MALE",
      "maritalStatus": "MARRIED",
      "numberOfDependents": 2,
      "politicallyExposedPersons": [
        {
          "name": "Alex Carter",
          "relationship": "Brother",
          "position": "Minister of Finance"
        }
      ]
    },

    "identificationInformation": {
      "identifications": [
        {
          "externalSyncId": "id-001",
          "type": "SSN",
          "value": "123456789",
          "roles": ["TAX_REPORTING"],
          "issueDate": "2021-12-14",
          "expirationDate": "2029-12-14",
          "placeOfIssue": "New York",
          "countryOfIssue": "USA"
        }
      ]
    },

    "personalContactsInformation": {
      "emails": [
        {
          "externalSyncId": "email-001",
          "email": "john.doe@example.com",
          "type": "PERSONAL",
          "roles": ["PRIMARY", "STATEMENTS"]
        }
      ],
      "phones": [
        {
          "externalSyncId": "phone-001",
          "countryCode": "+1",
          "nationalDestinationCode": "212",
          "phoneNumber": "5551234",
          "type": "MOBILE",
          "roles": ["PRIMARY"]
        }
      ],
      "addresses": [
        {
          "externalSyncId": "addr-001",
          "line1": "123 Main Street",
          "line2": "Apt 4B",
          "city": "New York",
          "region": "US-NY",
          "postalCode": "10001",
          "type": "LEGAL",
          "roles": ["PRIMARY", "TAX_REPORTING"]
        }
      ]
    },

    "workInformation": {
      "employmentType": "EMPLOYED",
      "occupation": "Software Engineer",
      "typeOfBusiness": "INFORMATION"
    },

    "financialInformation": {
      "annualIncome": 75000,
      "liquidNetWorth": 150000,
      "totalNetWorth": 350000,
      "taxBracket": "TWENTY_TWO",
      "education": "EXTENSIVE"
    },

    "investmentExperience": [
      { "type": "STOCKS", "period": "YRS_5_PLUS" }
    ],

    "employerInformation": {
      "employer": "Acme Corporation",
      "isEmployerABroker": false
    },

    "associationInformation": {
      "isAssociatedWithFinance": false
    },

    "agreementsInformation": {
      "agreements": [
        {
          "name": "Customer Agreement",
          "hash": "e3b0c44298fc1c149afbf4c8996fb924...",
          "acceptedAt": "2025-12-15"
        }
      ]
    }
  },
  "meta": {}
}
```

### Field Reference -- CreateClientV3Dto

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `clientType` | `string` | **Yes** | `INDIVIDUAL`, `NON_INDIVIDUAL` |
| `subFirmNumber` | `number` | **Yes** | 1--999 |
| `externalId` | `string` | No | max 255 chars |
| `personalInformation` | object | **Yes** | See below |
| `identificationInformation` | object | **Yes** | See below |
| `personalContactsInformation` | object | **Yes** | See below |
| `workInformation` | object | No | See below |
| `investmentExperience` | array | No | max 15 items |
| `employerInformation` | object | No | See below |
| `financialInformation` | object | No | See below |
| `agreementsInformation` | object | No | |
| `associationInformation` | object | No | |
| `emergencyContactInformation` | object | No | |
| `disclosuresInformation` | object | No | |

#### personalInformation

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `firstName` | `string` | No | max 50, nullable |
| `middleName` | `string` | No | max 50, nullable |
| `lastName` | `string` | **Yes** | max 50 |
| `suffix` | `string` | No | max 10, nullable |
| `dateOfBirth` | `date` | **Yes** | ISO 8601 date |
| `countryOfLegalResidence` | `string` | **Yes** | 3-char ISO country |
| `countryOfCitizenship` | `string` | No | 3-char ISO country, nullable |
| `countryOfTaxResidence` | `string` | No | 3-char ISO country, nullable |
| `gender` | `string` | No | `MALE`, `FEMALE`, `OTHER` |
| `maritalStatus` | `string` | No | `MARRIED`, `SINGLE`, `DIVORCED`, `WIDOWED`, `PARTNER` |
| `numberOfDependents` | `number` | No | >= 0, nullable |
| `politicallyExposedPersons` | array | No | max 5 items |

#### identificationInformation.identifications[]

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `externalSyncId` | `string` | No | max 50 |
| `type` | `string` | **Yes** | `SSN`, `PASSPORT`, `DRIVERS_LICENSE`, `NATIONAL_ID`, `TAX_ID`, `WORK_PERMIT`, `OTHER` |
| `value` | `string` | **Yes** | max 30 |
| `roles` | `string[]` | **Yes** | `PRIMARY`, `TAX_REPORTING`, `VERIFICATION`, `KYC` |
| `issueDate` | `date` | No | |
| `expirationDate` | `date` | No | |
| `placeOfIssue` | `string` | No | max 50 |
| `countryOfIssue` | `string` | No | max 3 |

#### personalContactsInformation.emails[]

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `externalSyncId` | `string` | No | max 50 |
| `email` | `string` | **Yes** | |
| `type` | `string` | **Yes** | `PERSONAL`, `WORK`, `ORGANIZATION` |
| `roles` | `string[]` | **Yes** | `PRIMARY`, `STATEMENTS`, `TRADE_CONFIRMATIONS`, `TAX_DOCUMENTS`, `CORRESPONDENCE`, `MARKETING` |

#### personalContactsInformation.phones[]

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `externalSyncId` | `string` | No | max 50 |
| `countryCode` | `string` | **Yes** | max 5 (e.g. `"+1"`) |
| `nationalDestinationCode` | `string` | No | max 5 |
| `phoneNumber` | `string` | **Yes** | max 10 |
| `type` | `string` | **Yes** | `HOME`, `WORK`, `MOBILE`, `OTHER`, `FAX` |
| `roles` | `string[]` | **Yes** | `PRIMARY`, `SMS_ALERTS` |

#### personalContactsInformation.addresses[]

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `externalSyncId` | `string` | No | max 50 |
| `line1` | `string` | **Yes** | |
| `line2` | `string` | No | |
| `line3` | `string` | No | |
| `city` | `string` | **Yes** | max 50 |
| `region` | `string` | **Yes** | ISO 3166-2 (e.g. `"US-NY"`), max 6 |
| `postalCode` | `string` | **Yes** | max 10 |
| `type` | `string` | **Yes** | `LEGAL`, `MAILING`, `HOME`, `WORK`, `BILLING`, `OTHER` |
| `roles` | `string[]` | **Yes** | `PRIMARY`, `STATEMENTS`, `TAX_REPORTING` |

#### workInformation

| Field | Type | Required | Enums |
|---|---|---|---|
| `employmentType` | `string` | No | `EMPLOYED`, `SELF_EMPLOYED`, `RETIRED`, `STUDENT`, `NOT_EMPLOYED` |
| `occupation` | `string` | No | max 60 |
| `typeOfBusiness` | `string` | No | `ACCOMMODATION_AND_FOOD_SERVICES`, `AGRICULTURE_FORESTRY_FISHING_AND_HUNTING`, `ARTS_ENTERTAINMENT_AND_RECREATION`, `CONSTRUCTION`, `EDUCATIONAL_SERVICES`, `FINANCE_AND_INSURANCE`, `GAMING_OR_SPORTS_BETTING`, `HEALTH_CARE_AND_SOCIAL_ASSISTANCE`, `INFORMATION`, `MANUFACTURING`, `MINING_QUARRYING_AND_OIL_AND_GAS_EXTRACTION`, `PROFESSIONAL_SCIENTIFIC_AND_TECHNICAL_SERVICES`, `PUBLIC_ADMINISTRATION`, `REAL_ESTATE_AND_RENTAL_AND_LEASING`, `RETAIL_TRADE`, `TRANSPORTATION_AND_WAREHOUSING`, `UTILITIES`, `WHOLESALE_TRADE`, `OTHER_SERVICES`, `MANAGEMENT_OF_COMPANIES_AND_ENTERPRISES`, `ADMINISTRATIVE_AND_SUPPORT_AND_WASTE_MANAGEMENT_AND_REMEDIATION_SERVICES`, `ATHLETE_COLLEGIATE`, `ATHLETE_PROFESSIONAL`, `COACH_COLLEGIATE`, `COACH_PROFESSIONAL`, `JOURNALIST`, `REFEREE_COLLEGIATE`, `REFEREE_PROFESSIONAL` |

#### investmentExperience[]

| Field | Type | Required | Enums |
|---|---|---|---|
| `type` | `string` | **Yes** | `STOCKS`, `BONDS`, `MUTUAL_FUNDS`, `OPTIONS`, `FUTURES`, `EVENT_CONTRACTS`, `ANNUITIES`, `PARTNERSHIPS`, `OTHER` |
| `period` | `string` | **Yes** | `NONE`, `YRS_0_5`, `YRS_5_PLUS` |

#### financialInformation

| Field | Type | Required | Enums |
|---|---|---|---|
| `annualIncome` | `number` | No | |
| `liquidNetWorth` | `number` | No | |
| `totalNetWorth` | `number` | No | |
| `taxBracket` | `string` | No | `TEN`, `TWELVE`, `TWENTY_TWO`, `TWENTY_FOUR`, `THIRTY_TWO`, `THIRTY_FIVE`, `THIRTY_SEVEN` |
| `education` | `string` | No | `LIMITED`, `MODERATE`, `EXTENSIVE` |

### Response `201 Created`

```json
{
  "data": {
    "clientId": "123e4567-e89b-12d3-a456-426614174000",
    "clientType": "INDIVIDUAL",
    "subFirmNumber": 1,
    "status": "ACTIVE",
    "personalInformation": { "..." },
    "identificationInformation": { "..." },
    "personalContactsInformation": {
      "emails": [{ "id": "...", "email": "john.doe@example.com", "type": "PERSONAL", "roles": ["PRIMARY"] }],
      "phones": [{ "id": "...", "countryCode": "+1", "phoneNumber": "5551234", "type": "MOBILE", "roles": ["PRIMARY"] }],
      "addresses": [{ "id": "...", "line1": "123 Main Street", "city": "New York", "region": "US-NY", "postalCode": "10001", "type": "LEGAL", "roles": ["PRIMARY"] }]
    }
  },
  "meta": { "requestId": "..." }
}
```

### Error Responses

| Status | Code | Meaning |
|---|---|---|
| `400` | `INVALID_IDEMPOTENCY_KEY` | Key format/length invalid |
| `409` | `IDEMPOTENCY_KEY_MISMATCH` | Body differs from original request for same key |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## 3. Create Account

| | |
|---|---|
| **Endpoint** | `POST /v2/accounts` |
| **operationId** | `AccountsV2Controller_createAccountV2` |
| **Auth** | Bearer JWT |
| **Tags** | Accounts v2 |

Creates a brokerage account for a client. The combination of `accountType`, `entitlements`, and `leverageType` determines the account's capabilities.

### Account Configuration Matrix

| Vertical | accountType | entitlements | leverageType | Notes |
|---|---|---|---|---|
| **Event Contracts** | `INDIVIDUAL` | `EVENT_CONTRACTS` | `CASH` | -- |
| **Crypto** | `INDIVIDUAL` | `CRYPTO` | `CASH` | `accountConfiguration.signedIpAddress` recommended |
| **Fintech Retail** | `INDIVIDUAL` | `FINTECH_RETAIL` | `CASH` | -- |
| **Wealth** | `INDIVIDUAL`, `JOINT` | `WEALTH_MANAGEMENT` | `CASH`, `MARGIN` | Supports joint accounts and margin |

### Request

**Body -- CreateAccountsV2RequestDto**

```json
{
  "data": {
    "clientId": "987e4567-e89b-12d3-a456-426614174999",
    "name": "My Trading Account",
    "accountType": "INDIVIDUAL",
    "accountStatus": "OPEN",
    "entitlements": ["FINTECH_RETAIL"],
    "leverageType": "CASH",
    "representativeCode": "AA01",
    "isTradeRestricted": false,
    "hasBeneficialOwners": false,
    "isShell": false,
    "dividendReinvestmentInstruction": "REINVEST",
    "emailCommunication": ["MONTHLY_ACCOUNT_STATEMENTS", "TRADE_CONFIRMATIONS"],
    "investmentProfile": {
      "primaryObjective": "GROWTH",
      "secondaryObjectives": ["SPECULATION"],
      "riskTolerance": "MODERATE",
      "allocationPercentageRange": "LESS_THAN_ONE_THIRD",
      "timeHorizon": "ZERO_TO_FIVE_YEARS"
    },
    "sourceOfFunds": {
      "primary": "WAGE_INCOME",
      "secondary": ["SAVINGS"]
    },
    "liquidityAllocations": [
      { "horizon": "P_0_5_Y", "percentage": "30.0" },
      { "horizon": "P_5_10_Y", "percentage": "70.0" }
    ],
    "accountConfiguration": {
      "optionsTrading": false,
      "fdicSweep": true
    }
  },
  "meta": {}
}
```

### Field Reference -- CreateAccountV2Dto

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `clientId` | `string` | Conditional | UUID. Mutually exclusive with `clients`. |
| `clients` | array | Conditional | 1-10 `AccountClientLinkDto`. Mutually exclusive with `clientId`. |
| `name` | `string` | **Yes** | max 100 |
| `accountType` | `string` | **Yes** | `INDIVIDUAL`, `JOINT` |
| `accountStatus` | `string` | **Yes** | `OPEN`, `RESTRICTED`, `PENDING` (nullable) |
| `entitlements` | `string[]` | **Yes** | min 1. `EVENT_CONTRACTS`, `CRYPTO`, `FINTECH_RETAIL`, `WEALTH_MANAGEMENT` |
| `leverageType` | `string` | No | `CASH`, `MARGIN` |
| `contacts` | object | No | AccountContactLinksDto |
| `representativeCode` | `string` | No | 1-4 chars |
| `isTradeRestricted` | `boolean` | No | |
| `hasBeneficialOwners` | `boolean` | No | |
| `investmentProfile` | object | No | See below |
| `sourceOfFunds` | object | No | See below |
| `liquidityAllocations` | array | No | max 5. Percentages should sum to 100. |
| `dividendReinvestmentInstruction` | `string` | No | `PAID_IN_CASH_AND_HELD_IN_ACCOUNT`, `SEND_MONTHLY_CHECK`, `SEND_ACH`, `REINVEST` |
| `isShell` | `boolean` | No | |
| `accountConfiguration` | object | No | See below |
| `emailCommunication` | `string[]` | No | `MONTHLY_ACCOUNT_STATEMENTS`, `TRADE_CONFIRMATIONS`, `SHAREHOLDER_COMMUNICATIONS`, `POST_SALE_PROSPECTUS` |

#### clients[] -- AccountClientLinkDto

| Field | Type | Required | Enums |
|---|---|---|---|
| `clientId` | `string` (uuid) | **Yes** | |
| `isPrimary` | `boolean` | No | |
| `tradingAuthority` | `string` | No | `FULL_TRADING`, `LIMITED_TRADING`, `NO_TRADING` |
| `role` | `string` | No | `AUTH3RD`, `AUTHREP`, `NTHOLDER`, `TRDHOLDER` |
| `roleStartDate` | `date` | No | |
| `roleEndDate` | `date` | No | |

#### investmentProfile

| Field | Type | Required | Enums |
|---|---|---|---|
| `primaryObjective` | `string` | No | `INCOME`, `GROWTH`, `SPECULATION`, `TRADING` |
| `secondaryObjectives` | `string[]` | No | 1-3 items. Same enum as above. |
| `riskTolerance` | `string` | No | `CONSERVATIVE`, `MODERATE`, `AGGRESSIVE` |
| `allocationPercentageRange` | `string` | No | `LESS_THAN_ONE_THIRD`, `ONE_THIRD_TO_TWO_THIRDS`, `MORE_THAN_TWO_THIRDS` |
| `timeHorizon` | `string` | No | `ZERO_TO_FIVE_YEARS`, `FIVE_TO_TEN_YEARS`, `OVER_TEN_YEARS`, `NOT_APPLICABLE` |

#### sourceOfFunds

| Field | Type | Required | Enums |
|---|---|---|---|
| `primary` | `string` | **Yes** | `WAGE_INCOME`, `PENSION_RETIREMENT`, `FUNDS_FROM_ANOTHER_ACCOUNT`, `SAVINGS`, `SALE_OF_BUSINESS_OR_PROPERTY`, `INSURANCE_PAYOUT`, `GIFT_INHERITANCE`, `OTHER` |
| `secondary` | `string[]` | No | max 5. Same enum as primary. |

#### accountConfiguration

| Field | Type | Required | Description |
|---|---|---|---|
| `optionsTrading` | `boolean` | No | |
| `typeOfTrust` | `string` | No | max 50 |
| `fdicSweep` | `boolean` | No | |
| `signedIpAddress` | `string` | No | Required for CRYPTO entitlement |
| `signedAt` | `datetime` | No | Required for CRYPTO entitlement |

### Response `201 Created`

```json
{
  "data": {
    "accountId": "123e4567-e89b-12d3-a456-426614174000",
    "accountNumber": "AB00001337",
    "clientId": "987e4567-e89b-12d3-a456-426614174999",
    "name": "My Trading Account",
    "accountType": "INDIVIDUAL",
    "accountHolderType": "I",
    "accountStatus": "OPEN",
    "entitlements": ["FINTECH_RETAIL"],
    "leverageType": "CASH",
    "representativeCode": "AA01",
    "isTradeRestricted": false,
    "isShell": false
  },
  "meta": {}
}
```

| Response Field | Type | Description |
|---|---|---|
| `accountId` | `string` (uuid) | System-generated account ID |
| `accountNumber` | `string` | Human-readable account number |
| `accountHolderType` | `string` | FINRA/CAT type. Enum: `A`, `E`, `F`, `I`, `O`, `V`, `P`, `X` |

### Error Responses

| Status | Code | Meaning |
|---|---|---|
| `400` | `INVALID_IDEMPOTENCY_KEY` | Key format/length invalid |
| `404` | `NOT_FOUND` | Client not found |
| `409` | `IDEMPOTENCY_KEY_MISMATCH` | Body differs from original |

---

## 4. Link Payment Account

| | |
|---|---|
| **Endpoint** | `POST /v1/payments/payment-accounts` |
| **operationId** | `linkPaymentAccountV1` |
| **Auth** | Bearer JWT |
| **Tags** | Payment Accounts |

Links a new external payment account (bank, debit card, or wallet) to a client for funding transfers.

### Request

**Body -- LinkPaymentAccountRequestDto**

```json
{
  "data": {
    "clientId": "987e4567-e89b-12d3-a456-426614174999",
    "currency": "USD",
    "country": "USA",
    "maskedIdentifier": "****6721",
    "nickname": "National City Bank Checking",
    "details": {
      "type": "BANK_ACCOUNT",
      "accountHolderName": "Alex Morgan",
      "accountType": "CHECKING",
      "bankName": "National City Bank",
      "bankIdentifierType": "ABA_ROUTING",
      "bankIdentifier": "021000021"
    }
  },
  "meta": {}
}
```

### Field Reference -- PaymentAccountRequestDto

| Field | Type | Required | Constraints |
|---|---|---|---|
| `clientId` | `string` | **Yes** | |
| `currency` | `string` | **Yes** | ISO 4217, 3 chars (e.g. `"USD"`) |
| `country` | `string` | **Yes** | ISO 3166-1 alpha-3, 3 chars (e.g. `"USA"`) |
| `maskedIdentifier` | `string` | No | |
| `nickname` | `string` | No | |
| `externalId` | `string` | No | max 128 chars |
| `metadata` | `object` | No | Arbitrary key-value (string keys max 100, values max 1000) |
| `details` | `oneOf` | **Yes** | One of the three types below |

#### details -- BANK_ACCOUNT

| Field | Type | Required | Enums |
|---|---|---|---|
| `type` | `string` | **Yes** | `"BANK_ACCOUNT"` |
| `accountHolderName` | `string` | No | |
| `accountNumber` | `string` | No | |
| `accountType` | `string` | No | e.g. `"CHECKING"`, `"SAVINGS"` |
| `bankName` | `string` | No | |
| `bankAddress` | `string` | No | |
| `bankIdentifierType` | `string` | No | `ABA_ROUTING`, `IFSC`, `IBAN` |
| `bankIdentifier` | `string` | No | |

#### details -- DEBIT_CARD

| Field | Type | Required |
|---|---|---|
| `type` | `string` | **Yes** (`"DEBIT_CARD"`) |
| `network` | `string` | No (e.g. `"Visa"`) |
| `expiryMonth` | `integer` | No (1-12) |
| `expiryYear` | `integer` | No |
| `cardholderName` | `string` | No |

#### details -- WALLET

| Field | Type | Required | Enums |
|---|---|---|---|
| `type` | `string` | **Yes** (`"WALLET"`) |
| `provider` | `string` | **Yes** | `VENMO`, `PAYPAL` |
| `handle` | `string` | **Yes** | |
| `email` | `string` | No | |
| `phone` | `string` | No | |

### Response `201 Created`

```json
{
  "data": {
    "paymentAccountId": "a1b2c3d4-...",
    "status": "LINKED",
    "currency": "USD",
    "country": "USA",
    "maskedIdentifier": "****6721",
    "nickname": "National City Bank Checking",
    "createdAt": "2026-03-23T10:30:00.000Z",
    "details": {
      "type": "BANK_ACCOUNT",
      "accountHolderName": "Alex Morgan",
      "accountType": "CHECKING",
      "bankName": "National City Bank",
      "bankIdentifierType": "ABA_ROUTING",
      "bankIdentifier": "021000021"
    }
  },
  "meta": null
}
```

| Response Field | Type | Enums |
|---|---|---|
| `paymentAccountId` | `string` | |
| `status` | `string` | `LINKED`, `PENDING_VERIFICATION`, `BLOCKED`, `UNLINKED` |
| `currency` | `string` | ISO 4217 |
| `country` | `string` | ISO 3166-1 alpha-3 |
| `createdAt` | `datetime` | |
| `updatedAt` | `datetime` | |

---

## 5. Create Payment Instruction

| | |
|---|---|
| **Endpoint** | `POST /v1/payments/payment-instructions` |
| **operationId** | `createPaymentInstructionV1` |
| **Auth** | Bearer JWT |
| **Tags** | Payment Instructions |

Creates a payment instruction to move funds between accounts. Two payload variants exist depending on whether you specify source or destination amount.

### Transfer Type Compatibility

| Transfer Type | Source Account Type | Destination Account Type |
|---|---|---|
| `WIRE` | Payment Account (bank) | Client Account |
| `WIRE` | Client Account | Payment Account (bank) |
| `ACH` | Payment Account (bank) | Client Account |
| `ACH` | Client Account | Payment Account (bank) |
| `CARD` | Payment Account (debit card) | Client Account |
| `CARD` | Client Account | Payment Account (debit card) |
| `WALLET_TRANSFER` | Payment Account (wallet) | Client Account |
| `WALLET_TRANSFER` | Client Account | Payment Account (wallet) |
| `CASH_PROMOTION` | Partner Account | Client Account |
| `CASH_ADJUSTMENT` | Partner Account | Client Account |
| `CASH_ADJUSTMENT` | Client Account | Partner Account |

### Request -- Destination Amount Variant

```json
{
  "data": {
    "transferType": "ACH",
    "orchestrationMode": "SYSTEM_PROCESSOR",
    "sourceAccount": {
      "id": "payment-account-uuid",
      "type": "PAYMENT"
    },
    "destinationAccount": {
      "id": "brokerage-account-uuid",
      "type": "CLIENT"
    },
    "destinationCurrency": "USD",
    "destinationAmount": "500.00",
    "description": "Initial deposit"
  },
  "meta": {}
}
```

### Field Reference -- DestinationPaymentInstructionRequestDto

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `transferType` | `string` | **Yes** | `WIRE`, `ACH`, `CARD`, `CASH_PROMOTION`, `CASH_ADJUSTMENT`, `WALLET_TRANSFER` |
| `orchestrationMode` | `string` | **Yes** | `PARTNER_PROCESSOR`, `SYSTEM_PROCESSOR` |
| `description` | `string` | No | |
| `comment` | `string` | No | |
| `sourceAccount` | object | **Yes** | `{ id, type }` |
| `destinationAccount` | object | **Yes** | `{ id, type }` |
| `externalId` | `string` | No | max 128 |
| `metadata` | `object` | No | Arbitrary key-value |
| `destinationCurrency` | `string` | **Yes** | ISO 4217, 3 chars |
| `destinationAmount` | `string` | **Yes** | Decimal string (e.g. `"500.00"`) |

#### AccountDto (source/destination)

| Field | Type | Required | Enums |
|---|---|---|---|
| `id` | `string` | **Yes** | UUID |
| `type` | `string` | No | `CLIENT`, `PAYMENT`, `PARTNER` |

### Request -- Source Amount Variant (SourcePaymentInstructionRequestDto)

Same fields as above except uses `sourceCurrency` + `sourceAmount` instead of `destinationCurrency` + `destinationAmount`.

### Response `201 Created`

```json
{
  "data": {
    "id": "instruction-uuid",
    "transferType": "ACH",
    "orchestrationMode": "SYSTEM_PROCESSOR",
    "status": "COMPLETED",
    "sourceAccount": { "id": "...", "type": "PAYMENT" },
    "destinationAccount": { "id": "...", "type": "CLIENT" },
    "sourceCurrency": "USD",
    "sourceAmount": "500.00",
    "destinationCurrency": "USD",
    "destinationAmount": "500.00",
    "createdAt": "2026-03-23T10:31:00.000Z"
  },
  "meta": null
}
```

| Response Field | Type | Enums |
|---|---|---|
| `id` | `string` | |
| `status` | `string` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED` |
| `createdAt` | `datetime` | |
| `updatedAt` | `datetime` | |

---

## 6. Get Balances by Account ID

| | |
|---|---|
| **Endpoint** | `GET /v1/accounts/{accountId}/balances` |
| **operationId** | `BalancesController_getBalancesByAccountId` |
| **Auth** | Bearer JWT |
| **Tags** | Balances |

Retrieves comprehensive balance information for an account.

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `accountId` | `string` (uuid) | **Yes** | The account to query |

### Response `200 OK`

```json
{
  "data": {
    "accountId": "9c1e7a2b-4f8b-4f2c-9273-6a5e46c348f7",
    "accountValue": "30000.00",
    "accountCurrency": "USD",
    "portfolioValue": "25000.00",
    "totalInvestedValue": "20000.00",
    "availableMargin": "50000.00",
    "buyingPower": "150000.00",
    "cashAvailableForWithdrawal": "5000.00",
    "unavailableBalance": "1000.00"
  },
  "meta": {}
}
```

### Field Reference -- AccountBalancesDto

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `accountId` | `string` (uuid) | **Yes** | |
| `accountValue` | `string` | **Yes** | Total account value |
| `accountCurrency` | `string` | **Yes** | `USD`, `EUR`, `GBP`, `JPY`, `CAD`, `AUD`, `CHF`, `CNY` |
| `portfolioValue` | `string` | **Yes** | Market value of all positions |
| `totalInvestedValue` | `string` | **Yes** | Cost basis of all positions |
| `availableMargin` | `string` | **Yes** | Margin available (0 for cash accounts) |
| `buyingPower` | `string` | **Yes** | Cash + margin available for trades |
| `cashAvailableForWithdrawal` | `string` | **Yes** | Settled cash withdrawable |
| `unavailableBalance` | `string` | **Yes** | Unsettled/held funds |

### Error Responses

| Status | Code |
|---|---|
| `404` | `NOT_FOUND` -- Account does not exist |
| `500` | `INTERNAL_SERVER_ERROR` |

---

## 7. Create New Order

| | |
|---|---|
| **Endpoint** | `POST /v1/orders` |
| **operationId** | `createOrderV1` |
| **Auth** | Bearer JWT |
| **Tags** | Orders |

Place a new order under the given account. Rejected if the account cannot trade the specified asset or has insufficient buying power.

### Request

**Headers**

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer {token}` |
| `idempotency-key` | No | 1-255 chars |
| `request-id` | No | Client correlation ID (server generates if omitted) |

**Body -- CreateOrderRequestDto**

```json
{
  "data": {
    "accountID": "018f3f95-6b27-7c5f-bcf5-2b7f5a1a4d2e",
    "assetIdentifier": "TSLA",
    "assetIdentifierType": "SYMBOL",
    "assetClass": "EQUITY",
    "side": "BUY",
    "orderType": "MARKET",
    "timeInForce": "DAY",
    "notionalAmount": "100.00"
  },
  "meta": {}
}
```

### Field Reference -- CreateOrderDto

| Field | Type | Required | Enums / Constraints |
|---|---|---|---|
| `orderType` | `string` | **Yes** | `MARKET`, `LIMIT`, `STOP`, `STOP_LIMIT`, `MARKET_IF_TOUCHED` |
| `side` | `string` | **Yes** | Equities: `BUY`, `SELL`. Options: `BUY_OPEN`, `SELL_OPEN`, `BUY_CLOSE`, `SELL_CLOSE` |
| `assetIdentifierType` | `string` | **Yes** | `SYMBOL`, `CUSIP`, `ISIN`, `TRADING_PAIR` |
| `assetIdentifier` | `string` | **Yes** | The ticker, CUSIP, ISIN, or trading pair |
| `assetClass` | `string` | No | `EQUITY`, `OPTION`, `FIXED_INCOME`, `MUTUAL_FUND`, `CRYPTO`, `FUTURE`, `FOREX` |
| `accountID` | `string` (uuid) | **Yes** | Must belong to authorized org and be active |
| `timeInForce` | `string` | **Yes** | `DAY`, `GTC`, `IOC`, `FOK`, `OPG`, `GTD`, `GTX` |
| `quantity` | `string` | Conditional | Decimal. Cannot be used with `notionalAmount`. |
| `notionalAmount` | `string` | Conditional | Pattern: `/^\d+\.\d{2}$/`. Cannot be used with `quantity`. |
| `limitPrice` | `string` | Conditional | Required for LIMIT, STOP_LIMIT. Pattern: `/^\d+\.\d{2}$/` |
| `stopPrice` | `string` | Conditional | Required for STOP, STOP_LIMIT. Pattern: `/^\d+\.\d{2}$/` |
| `externalId` | `string` | No | max 225 chars |
| `expirationDate` | `string` | Conditional | Required for GTC option orders. Pattern: `/^\d{4}-\d{2}-\d{2}$/`. Max ~90 days. |

### Time-in-Force by Asset Class

| TIF | Equities | Options | Fixed Income | Mutual Funds | Crypto |
|---|---|---|---|---|---|
| `DAY` | Yes | Yes | Yes | Yes | Yes |
| `GTC` | Yes | Yes | Yes | -- | Yes |
| `IOC` | Yes | -- | -- | -- | Yes |
| `FOK` | Yes | -- | -- | -- | Yes |
| `OPG` | Yes | -- | -- | -- | -- |
| `GTD` | -- | -- | -- | -- | -- |
| `GTX` | -- | -- | -- | -- | -- |

### Response `201 Created`

```json
{
  "data": {
    "status": "NEW",
    "orderId": "0194f7e0-3b6a-7d8f-8b2a-1f2e3d4c5b6a",
    "externalId": "client-order-12345"
  },
  "meta": {}
}
```

### Field Reference -- OrderDto

| Field | Type | Required | Enums |
|---|---|---|---|
| `status` | `string` | **Yes** | `NEW`, `PENDING`, `FILLED`, `REJECTED`, `PENDING_CANCEL`, `CANCELED`, `EXPIRED` |
| `orderId` | `string` | **Yes** | System-generated UUID |
| `externalId` | `string` | No | Client-provided, echoed back |

### Response `202 Accepted` (Still Processing)

```json
{
  "errors": [
    { "code": "REQUEST_PROCESSING", "title": "Request is still being processed" }
  ],
  "meta": { "requestId": "..." }
}
```

`Retry-After` header indicates seconds to wait.

### Error Responses

| Status | Code | Meaning |
|---|---|---|
| `400` | `INVALID_SYMBOL` | Asset identifier unrecognized |
| `400` | `INVALID_TIME_IN_FORCE` | TIF not valid for asset class |
| `401` | `INVALID_ACCOUNT` | Token missing/invalid or does not authorize this account |
| `409` | `EXTERNAL_ID_CONFLICT` | `externalId` already tied to another order |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected error |

---

## Demo Flow Summary

```
Step 1: POST /v1/auth/token           --> Bearer token
Step 2: POST /v2/clients              --> clientId
Step 3: POST /v2/accounts             --> accountId (FINTECH_RETAIL)
Step 4: POST /v1/payments/payment-accounts        --> paymentAccountId
Step 5: POST /v1/payments/payment-instructions    --> instructionId (ACH deposit)
Step 6: GET  /v1/accounts/{accountId}/balances     --> $500.00 buying power
Step 7: POST /v1/orders               --> orderId (TSLA, $100 MARKET BUY)
Step 8: GET  /v1/accounts/{accountId}/balances     --> $400.00 buying power
Step 9: POST /v2/accounts             --> ecAccountId (EVENT_CONTRACTS)
```
