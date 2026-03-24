# Wedbush API Demo

Interactive simulation of the Wedbush Technology Solutions API, showing a consumer-facing app alongside the underlying API call sequence.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo flow

The app walks through four stages, each wired to simulated Wedbush API endpoints:

| Stage | UI Action | Simulated API Calls |
|---|---|---|
| **1. Open Investing** | Confirm pre-filled customer profile and click "Open Account" | `POST /v1/auth/token`, `POST /v2/clients`, `POST /v2/accounts` (FINTECH_RETAIL) |
| **2. Fund Account** | Review bank details and click "Deposit $500.00" | `POST /v1/payments/payment-accounts`, `POST /v1/payments/payment-instructions`, `GET /v1/accounts/{id}/balances` |
| **3. Buy TSLA** | Review order details and click "Buy $100.00 of TSLA" | `POST /v1/orders` (MARKET, notional $100), `GET /v1/accounts/{id}/balances` |
| **4. Event Contracts** | Review account type and click "Open Event Contracts" | `POST /v2/accounts` (EVENT_CONTRACTS) |

Click **Reset Demo** at any time to start over.

## How it works

- **Left panel** – a phone-frame styled consumer app UI.
- **Right panel** – a live API sequence log showing every request/response.
- **No network calls** – all API interactions are locally simulated with realistic payloads matching the Wedbush OpenAPI schemas.
- IDs (`clientId`, `accountId`, `orderId`, etc.) propagate between stages and are visible in both the UI and the API log.

## Project structure

```
src/
  main.tsx                   Entry point
  App.tsx                    Root layout, state reducer, stage orchestration
  styles.css                 All styles (CSS custom properties, responsive)
  types/wedbush.ts           Stage definitions, AppState, ApiLogEntry types
  data/mockSeeds.ts          Seed data for mock client, bank, and trade
  sim/apiSimulator.ts        Per-stage endpoint simulators (deterministic)
  sim/scenarioEngine.ts      Connects UI dispatch to simulator functions
  components/
    StoryProgress.tsx         Top nav showing the 4 demo stages
    PhoneFrame.tsx            Phone-styled card container
    AppSurface.tsx            Stage-specific UI for each demo step
    ApiSequencePanel.tsx      Right panel listing API request/response cards
```

## Simulated endpoint mapping

| Endpoint | Schema Source |
|---|---|
| `POST /v1/auth/token` | `authjwtcontroller_token` |
| `POST /v2/clients` | `clientsv2controller_createclient` |
| `POST /v2/accounts` | `accountsv2controller_createaccountv2` |
| `POST /v1/payments/payment-accounts` | `linkpaymentaccountv1` |
| `POST /v1/payments/payment-instructions` | `createpaymentinstructionv1` |
| `GET /v1/accounts/{id}/balances` | `balancescontroller_getbalancesbyaccountid` |
| `POST /v1/orders` | `createorderv1` |
