import os
from openai import OpenAI

# Initialize the OpenAI client with Vanchin settings
client = OpenAI(
    base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
    api_key="WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"  # VANCHIN_API_KEY_1
)

# Single-round test
print("----- standard request -----")
try:
    completion = client.chat.completions.create(
        model="ep-lpvcnv-1761467347624133479",  # VANCHIN_ENDPOINT_1
        messages=[
            {"role": "system", "content": "You are an AI assistant"},
            {"role": "user", "content": "Say hello in Thai"},
        ],
    )
    print("Success!")
    print(completion.choices[0].message.content)
except Exception as e:
    print(f"Error: {e}")
