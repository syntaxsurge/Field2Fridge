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

## Connect Mailbox via Agentverse (fixes 401s)
1) Keep `python agent.py` running.
2) Copy the inspector URL printed in logs (looks like https://agentverse.ai/inspect/?uri=...&address=agent1...).
3) Open it in your browser, click **Connect**, choose **Mailbox**, and approve.
4) Back in the terminal you should see “Mailbox access token acquired” and 401 errors stop. The Local Agent Inspector will also stop showing “Could not find this agent”.
```

When running, you should see logs about Almanac/Agentverse registration and an inspector URL you can open in the browser.
