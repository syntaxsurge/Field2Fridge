import os
from datetime import datetime
from uuid import uuid4

from dotenv import load_dotenv
from openai import OpenAI
from uagents import Agent, Context, Model, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

load_dotenv()

SUBJECT_MATTER = os.getenv(
    "FIELD2FRIDGE_SUBJECT",
    "field-to-fridge supply chain, household carts and farmer climate risk",
)

client = OpenAI(
    base_url="https://api.asi1.ai/v1",
    api_key=os.getenv("ASI1_API_KEY"),
)

agent = Agent(
    name="Field2FridgeASI",
    seed=os.getenv("AGENT_SEED_PHRASE", "field2fridge-seedphrase"),
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"],
    mailbox=True,
    publish_agent_details=True,
    network="testnet",
)

protocol = Protocol(spec=chat_protocol_spec)


@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(
        sender,
        ChatAcknowledgement(timestamp=datetime.now(), acknowledged_msg_id=msg.msg_id),
    )

    text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text

    response_text = "I'm sorry, something went wrong and I'm unable to answer your question."

    try:
        completion = client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are the Field2Fridge expert agent. Only answer questions about:
- household pantry guardrails and auto-cart behavior
- grocery execution safety on BNB Chain with spend caps and allow/deny lists
- farmer climate risk using NASA POWER-style data
- Akedo-style grocery safety and SpaceAgri-aligned field planning
Subject matter focus: {SUBJECT_MATTER}""",
                },
                {"role": "user", "content": text},
            ],
            max_tokens=1024,
        )
        response_text = str(completion.choices[0].message.content)
    except Exception:
        ctx.logger.exception("Error querying ASI:One / ASI1-Mini model")

    await ctx.send(
        sender,
        ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[
                TextContent(type="text", text=response_text),
                EndSessionContent(type="end-session"),
            ],
        ),
    )


@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Got ack from {sender} for {msg.acknowledged_msg_id}")


agent.include(protocol, publish_manifest=True)


class CartDecisionRequest(Model):
    wallet: str
    vendor: str
    total_usd: float
    status: str


class CartDecisionResponse(Model):
    ok: bool
    message: str


@agent.on_rest_post("/cart_decision", CartDecisionRequest, CartDecisionResponse)
async def rest_cart_decision(ctx: Context, req: CartDecisionRequest) -> CartDecisionResponse:
    ctx.logger.info(
        f"REST cart_decision from {req.wallet}: {req.status} {req.vendor} ${req.total_usd}"
    )
    return CartDecisionResponse(ok=True, message="Recorded by Field2FridgeASI")


if __name__ == "__main__":
    agent.run()
