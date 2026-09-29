import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

client = Hindsight(
    base_url=os.getenv("HINDSIGHT_API_URL"),
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = "novapay-engineering-v2"


def create_memory_bank():
    client.create_bank(
        bank_id=BANK_ID,
        name="NovaPay Engineering Memory"
    )


def store_memory(content, context=None):
    client.retain(
        bank_id=BANK_ID,
        content=content,
        context=context
    )


def recall_memory(query):
    result = client.recall(
        bank_id=BANK_ID,
        query=query
    )

    return result.results