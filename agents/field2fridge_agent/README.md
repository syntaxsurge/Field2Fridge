# Field2Fridge ASI uAgent

Python uAgent for Agentverse/ASI:One, with ASI-1 Mini chat + cart decision webhook.

## Quick start

```bash
cd agents/field2fridge_agent

# 1) Create venv
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2) Install deps
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# 3) Configure secrets
cp .env.example .env
# edit .env and set:
#   ASI1_API_KEY        # from https://asi1.ai dashboard
#   AGENT_SEED_PHRASE   # your deterministic agent seed (keep private)
#   FIELD2FRIDGE_SUBJECT (optional descriptive string)

# 4) Run agent (opens mailbox + REST on port 8001)
python agent.py

# Useful logs: agent address, Almanac/Agentverse registration, inspector URL.

## If Agentverse says “Agent Not Found”
1) With the agent running, verify it’s reachable locally:
   - `curl http://127.0.0.1:8001/.well-known/agent.json` should return a JSON block with name/address/endpoints.
   - If curl fails, check firewall/VPN and confirm you’re running on the same machine/port and that `endpoint=["http://127.0.0.1:8001/submit"]` is set in `agent.py`.
2) Open the inspector link printed in logs (https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8001&address=agent1...).
3) If still not found, try another browser/incognito and ensure the URL uses `127.0.0.1:8001`.

## Optional: Mailbox mode
This agent is configured for a direct local endpoint (`endpoint=[http://127.0.0.1:8001/submit]`). If you want Agentverse-hosted Mailbox instead, remove the `endpoint` argument in `agent.py`, set `mailbox=True`, restart, open the inspector link, and click **Connect → Mailbox**. Then you should see “Mailbox access token acquired” in logs.
```

When running, you should see logs about Almanac/Agentverse registration and an inspector URL you can open in the browser.
