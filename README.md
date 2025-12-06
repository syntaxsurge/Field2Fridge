# Field2Fridge

Field2Fridge is a Next.js 15 App Router project that keeps household pantries stocked and gives farmers an on-chain agent that can prove yield outlooks. The farmer side now grounds simulations in **NASA POWER agroclimate data** (no API key required) while the rest of the stack runs on BNB testnet with Convex-backed state and ChainGPT for research.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- Convex for wallet-scoped data (pantry, carts, controls, simulations, audit logs)
- RainbowKit + wagmi for BNB testnet wallets
- NASA POWER daily agroclimatology API for climate signals
- ChainGPT API for the `/copilot` assistant
- Q402/x-payment gateway (Express) for sign-to-pay protected on-chain actions

## Quick start

```bash
pnpm install
pnpm dev          # Next.js
pnpm convex:dev   # Convex (requires Convex CLI login)
pnpm payments:dev # optional: 402 gateway
```

### Required environment

Set these in `.env.local` (or `.env` for local dev):

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_CONVEX_URL`
- `CHAINGPT_API_KEY` and `CHAINGPT_BASE_URL`
- `NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS`, `NEXT_PUBLIC_SERVICE_TOKEN_ADDRESS` (BNB testnet)
- `Q402_SPONSOR_SECRET` (for 402 gateway) and optional signer/RPC for x402 flows
- `MEMBASE_*` if using Unibase memory

NASA POWER requires **no** keys or additional env. Clean the SpaceAgri placeholders from existing envs; they are unused.

## Farmer simulations (NASA POWER)

- Route: `POST /api/climate/simulate`
- Input: `crop`, `region`, `fieldSizeHa`, optional `latitude`/`longitude` (defaults to the US ag belt for demos)
- Behavior: fetches the last 90 days of daily climate data from NASA POWER (AG community), computes mean temperature, total rainfall, drought days, and solar irradiance, derives a risk score, and ranks varieties with yield deltas.
- Storage: top recommendation plus climate metrics are persisted per wallet in Convex for dashboard/history views.

## Household + copilot surfaces

- Household: `/household/pantry`, `/household/cart`, `/household/controls` with guardrails (weekly budget, allow/deny lists, approval modes) and audit logs.
- Copilot: `/copilot` proxies ChainGPT for research and audits; Execute tab runs Q402-gated transfers/agent registry calls with spend caps, allow/deny lists, previews, and risk warnings.

## Q402 gateway

- Express app at `payments/server.ts`, protected by `createQ402Middleware` and funded by `Q402_SIGNER_PRIVATE_KEY`.
- Configure `Q402_GATEWAY_URL`, `Q402_TOKEN_ADDRESS`, `Q402_IMPLEMENTATION_CONTRACT`, `Q402_VERIFYING_CONTRACT`, `Q402_RECIPIENT_ADDRESS`, and `Q402_RPC_URL` in env.
- Next routes `/api/actions/payment-details` and `/api/actions/execute` proxy through the gateway; client builds the `x-payment` header using q402 core helpers.

## Testing and readiness

- `pnpm typecheck` — TypeScript no-emit
- `pnpm lint` — ESLint
- `pnpm build` — production build

Run typecheck/build before shipping to keep the Convex schema and Next.js routes healthy.
