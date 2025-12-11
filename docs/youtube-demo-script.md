# Field2Fridge – YouTube Demo Script (End-to-End Flow)

This file is the **final script** for recording the Field2Fridge demo video. Follow the sections in order.

---

## 0. Before Recording – Processes to Start

From the **repo root**:

### Terminal 1 – Convex dev backend

```bash
pnpm run convex:dev
```

### Terminal 2 – Next.js dev server

```bash
pnpm dev
```

### Terminal 3 – ASI uAgent (Python)

```bash
cd agents/field2fridge_agent
source .venv/bin/activate      # or .venv\Scripts\activate on Windows
python agent.py
```

You should see logs like:

- `Starting agent with address: agent1…`
- `Manifest published successfully: ChatProtocol`
- `Registration on Almanac API successful`
- `Starting server on http://0.0.0.0:8001`

> This is your **Field2FridgeASI** uAgent built with Fetch.ai uAgents, using ASI-1 Mini via the ASI:One OpenAI-compatible API.

### Terminal 4 – 402 Demo Gateway (for Execute demo)

```bash
pnpm run payments:dev
# "payments:dev": "tsx payments/server.ts"
```

You should see:

```text
[402-demo] network: BSC_TESTNET
[402-demo] rpcUrl: https://bsc-testnet.publicnode.com
[402-demo] signerPk present: true
402 demo gateway running on http://localhost:4020
```

> This is the **402 gateway** (x402-style) that returns `HTTP 402` with payment details first, then accepts signed witnesses.

Open a browser at: `http://localhost:3000/`.

---

## 1. Household – Akedo Track (Pantry → Safety → Cart Simulation)

### 1.1 Connect BNB Testnet Wallet & Sign In as Household

- **URL:** `/`
- **Steps:**

  1. Open `http://localhost:3000/`.
  2. Click **Connect** (RainbowKit) in the header. Choose **MetaMask** and ensure network is **BNB Smart Chain Testnet**.
  3. Click **Sign in** in the header → `/sign-in`.
  4. On `/sign-in`, select the **Household** role.
  5. Click **Continue to onboarding** → `/dashboard`.

**Voiceover:**

> “I start on the Field2Fridge landing page and connect a **BNB testnet** wallet via RainbowKit. The wallet is the identity of my agent — no passwords. On the sign-in screen I choose **Household**, which creates a Convex profile and routes me to the household dashboard.”

---

### 1.2 Household Dashboard → Open Household Workspace

- **URL:** `/dashboard` (Household)
- **Steps:**

  1. Confirm the top subheading says: `Signed in as household — 0x…`.
  2. In the **Next actions** row, click **Open workspace** → `/household/pantry`.

**Voiceover:**

> “The household dashboard summarizes pantry risk, spend guardrails, and upcoming carts. I click **Open workspace** to configure inventory and policies.”

---

### 1.3 Pantry – Add Inventory & Risk

- **URL:** `/household/pantry`
- **What you see:** “Household workspace”; tabs `Pantry | Cart | Safety`; inventory table + form.
- **Steps:**

  1. Add **Coffee beans** — Quantity `1.5` kg, Avg daily use `0.1` → **Save item**.
  2. Add **Oat milk** — Quantity `3` pcs, Avg daily use `0.75` → **Save item**.
  3. Show table:
     - Coffee beans — `1.5 kg` — ~15.0 days left — status **Comfortable**.
     - Oat milk — `3 pcs` — ~4.0 days left — status **Watch/Critical**.
  4. Click **Oat milk** row to show it loads into the form.
  5. Click the **Safety** tab → `/household/controls`.

**Voiceover:**

> “I add **Coffee beans** and **Oat milk**. We store this in Convex and compute `daysLeft = quantity / avgDailyUse`, labeling items **Comfortable**, **Watch**, or **Critical**. Coffee is safe; Oat milk is at risk — that drives our Akedo-style auto-cart.”

---

### 1.4 Safety – Budget, Vendors, Approval Mode

- **URL:** `/household/controls`
- **Steps:**

  1. Budget/caps: **Weekly budget (USD)** `120`; **Auto-approve carts under (USD)** `45`.
  2. Vendors: check **Amazon** and **Walmart**.
  3. Approval mode: select **Auto-approve under caps**.
  4. Click **Save controls** (wait for toast).
  5. Click the **Cart** tab → `/household/cart`.

**Voiceover:**

> “Guardrails: weekly budget **$120**, auto-approve under **$45**, allowed vendors **Amazon** and **Walmart**. Approval mode is **Auto-approve under caps** — persisted in Convex and enforced on every cart.”

---

### 1.5 Cart – Approve Simulated Walmart Cart

- **URL:** `/household/cart`
- **What you see:** Recommended cart, buttons (**Approve & create sandbox cart**, **Decline & recompute**), audit log.
- **Steps:**

  1. Point out recommended cart: `Oat milk`, Qty `4 pcs`, Vendor `Walmart`, Est. total `≈ $32.00`, note “Auto-approve under $45 cap”.
  2. Click **Approve & create sandbox cart**.
  3. Show audit log row: `approved`, `Vendor: Walmart`, `Status: simulated`, `1 items — $32.00`.

**Voiceover:**

> “The agent proposes **Oat milk** from **Walmart** for about **$32** — under cap and allowed vendor. Akedo mentors allow high-fidelity **simulation** when Amazon/Walmart production APIs aren’t usable, so we log a simulated payload and approval in Convex.”

---

## 2. Settings – Global BNB Caps & Contract Allowlists

### 2.1 Safety & Environment – Network and Policy

- **URL:** `/settings` (via header).
- **Steps:**

  1. Network: choose **BNB testnet**.
  2. Spend ceiling: **Max per request (USD)** `300`; **Max per on-chain tx (USD)** `75`.
  3. Protections: check **Transaction warnings** and **Allow / deny lists**.
  4. Contract allow/deny lists:
     - **Allowed contracts:** `0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1,0xF5FCDBe9d4247D76c7fa5d2E06dBA1e77887F518`
     - **Blocked contracts:** leave empty.
  5. Click **Save**.

**Voiceover:**

> “Global BNB safety: keep to **testnet**, cap requests at **$300** and per-tx at **$75**, enable warnings and allow/deny lists. Only our registry (`0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1`) and service token (`0xF5FCDBe9d4247D76c7fa5d2E06dBA1e77887F518`) are allowed before any 402 execution runs.”

---

## 3. Farmer – SpaceAgri Track (NASA POWER Climate Sim)

### 3.1 Sign In as Farmer & Open Field Planner

- **URLs:** `/sign-in` → `/dashboard` → `/farmer/fields`
- **Steps:**

  1. Click **Sign in** (header).
  2. On `/sign-in`, choose **Farmer** → **Continue to onboarding** → `/dashboard`.
  3. Confirm subheading `Signed in as farmer — 0x…`.
  4. Click **Run climate simulation** → `/farmer/fields`.

**Voiceover:**

> “Switching to **Farmer**, the dashboard shows yield outlook and contract addresses. I open the Field planner to run a climate simulation.”

---

### 3.2 Field Planner – NASA POWER AG Daily API

- **URL:** `/farmer/fields`
- **Form values:** Crop `Corn`; Region `Iowa – US Midwest`; Field size `8` ha; Latitude `42.0`; Longitude `-93.0`.
- **Steps:**

  1. Use **Use example field** or enter the values above.
  2. Click **Run simulation** (hits `/api/climate/simulate` which calls NASA POWER Daily API, `community=AG`, with T2M_MAX/T2M_MIN/PRECTOT).
  3. Show results: mean temperature, total rainfall, drought days, risk label.
  4. Show History entry appended.

**Voiceover:**

> “We call NASA’s **POWER Daily API** in the Agroclimatology community, requesting daily max/min temps and precipitation for these coordinates. We aggregate into mean temperature, total rainfall, and drought days, then label drought risk. Results are stored per wallet/field in Convex — our **SpaceAgri** alignment with real open agroclimate data.”

---

## 4. Copilot – ChainGPT Web3 LLM & Smart Contract Auditor

### 4.1 Research Tab – Web3 Assistant

- **URL:** `/copilot` (Research tab).
- **Prompt:**

  ```text
  Explain the security and UX tradeoffs of granting unlimited approvals to the Field2Fridge ServiceToken on BNB testnet.
  ```

- **Steps:**

  1. Enter the prompt, click **Ask**.
  2. Show response (via `POST /api/copilot/chat` → `https://api.chaingpt.org/chat/stream`).

**Voiceover:**

> “ChainGPT’s Web3 LLM explains allowance risk and UX tradeoffs for our service token. This is the research leg of the **Quack × ChainGPT** bounty.”

---

### 4.2 Audit Tab – Smart Contract Auditor

- **URL:** `/copilot` (Audit tab).
- **Steps:**

  1. Enter:

     ```text
     Please audit this agent registry contract on BNB testnet for common access control and upgradeability risks.

     Contract address: 0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1
     ```

  2. Click **Run audit**.
  3. Show AI audit report (via `POST /api/copilot/audit` → ChainGPT Auditor model).

**Voiceover:**

> “On Audit, we send our BNB agent registry to ChainGPT’s Smart Contract Auditor and get an AI-generated report on access control and upgradeability — the second ChainGPT API integration.”

---

## 5. (Optional) Execute Tab – 402-Style “Register Agent” Flow

> Include if `/api/actions/execute` + `payments/server.ts` are stable.

- **URL:** `/copilot` (Execute tab).
- **Steps:**

  1. Choose **Register agent**. Set Agent ID `farmer-corn-iowa`, Network **BNB testnet**.
  2. Click **Preview transaction**:
     - Contract: `0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1`
     - Function: `register(string tokenURI_)`
     - Args: `[ "farmer-corn-iowa" ]`
     - Show estimated USD gas + ChainGPT risk blurb.
  3. Click **Execute via 402**:
     - First call to `/api/actions/execute` → gateway returns `HTTP 402 Payment Required` with `paymentDetails` (scheme `evm/eip712-witness-demo`, network `bsc-testnet`, token/amount/to, EIP-712 witness).
     - Show this JSON in the debug panel and Network tab.
  4. UI shows paywall: “Sign payment witness & register agent”.
  5. Click **Confirm / Pay & Execute**:
     - Client signs witness via wagmi `signTypedDataAsync`.
     - Second call sends `{ tx, witness, signature }`.
     - Gateway enforces caps/allowlist and simulates or sends tx; returns `{ ok: true, txHash }`.
  6. Show returned `txHash` (or `0xSIMULATED`).

**Voiceover:**

> “Execute shows our **402-style** pay-per-action flow. First call yields `HTTP 402` with a machine-readable payment description (EIP-712 witness). The client signs it and resubmits; the gateway enforces caps and contract allowlists, then simulates or sends on BNB testnet. This is our live x402 demonstration for the **Quack × ChainGPT** (and AWE) track.”

---

## 6. ASI / Fetch / Agentverse – Field2FridgeASI uAgent

### 6.1 Show uAgent Logs & Explain ASI-1 Mini

- **Terminal:** where `python agent.py` runs.
- **Callouts:** address line, manifest published, Almanac registration, server start.

**Voiceover:**

> “Field2FridgeASI is a Fetch **uAgent** using **ASI-1 Mini** via ASI:One. It publishes Chat Protocol, registers with the Almanac, and listens on port 8001. This satisfies the ASI/Fetch/Agentverse track.”

---

### 6.2 Test the REST Bridge Manually

- **Terminal:** new shell (agent still running).

```bash
curl -X POST http://127.0.0.1:8001/cart_decision \
  -H "Content-Type: application/json" \
  -d '{"wallet": "0x111111111111111111111111111111111111ABCD", "vendor": "Walmart", "total_usd": 32, "status": "approved"}'
```

Expected:

- Response: `{"ok": true, "message": "Recorded by Field2FridgeASI"}`
- Agent logs: `REST cart_decision from 0x111111111111111111111111111111111111ABCD: approved Walmart $32.0`

**Voiceover:**

> “The uAgent exposes `/cart_decision`. Posting a simulated approval logs it and responds OK — bridging web events into the ASI agent layer.”

---

### 6.3 Show Real Cart Approval Hitting the uAgent

- In the web app: `/household/cart` → approve another cart.
- In agent logs: see `REST cart_decision from 0x<your-wallet>: approved Walmart $32.0`.

**Voiceover:**

> “When the household UI approves a cart, we also send a `CartDecision` to Field2FridgeASI. The ASI agent perceives household behavior and can use **ASI-1 Mini** for long-term reasoning and coordination.”

---

## 7. Final Wrap-Up

**Voiceover:**

> “Recap:
>
> - **Akedo:** Household shopping agent tracks pantry, enforces budgets/allowlists, and auto-approves simulated Amazon/Walmart carts with full audit logs.
> - **SpaceAgri:** Farmer agent uses **NASA POWER Agroclimatology Daily** data to compute climate risk per field.
> - **Quack × ChainGPT:** ChainGPT Web3 LLM + Smart Contract Auditor for research/audit, plus a 402-style pay-per-execute gateway with caps and allowlists on BNB testnet.
> - **ASI / Fetch / Agentverse:** Field2FridgeASI uAgent (uAgents + ASI-1 Mini + Chat Protocol) receives cart events and can be orchestrated by the ASI stack.
>
> Field2Fridge is a single agent network that perceives, reasons, and acts safely across decentralized systems — from fields to fridges.”
