#!/usr/bin/env python3
"""
Test Vanchin API directly using the format from user's example
"""
import os
import json
import sys

# Read vanchin_keys.json
with open('vanchin_keys.json', 'r') as f:
    config = json.load(f)

base_url = config['base_url']
agent = config['agents'][0]  # Use first agent

print(f"Testing Vanchin API")
print(f"Base URL: {base_url}")
print(f"Agent: {agent['name']}")
print(f"Endpoint ID: {agent['endpoint_id']}")
print(f"API Key: {agent['api_key'][:20]}...")
print("-" * 60)

# Test using OpenAI SDK (as shown in user's example)
try:
    from openai import OpenAI
    
    client = OpenAI(
        base_url=base_url,
        api_key=agent['api_key']
    )
    
    print("\n[TEST 1] Using OpenAI SDK (recommended method)")
    print("Sending request...")
    
    completion = client.chat.completions.create(
        model=agent['endpoint_id'],
        messages=[
            {"role": "system", "content": "You are an AI assistant"},
            {"role": "user", "content": "Say hello in Thai"},
        ],
        max_tokens=50
    )
    
    print(f"✅ Success!")
    print(f"Response: {completion.choices[0].message.content}")
    print(f"Model: {completion.model}")
    print(f"Usage: {completion.usage}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Test using raw requests (current implementation)
print("\n" + "=" * 60)
print("[TEST 2] Using raw requests (current implementation)")
print("Sending request...")

try:
    import requests
    
    url = f"{base_url}/chat/completions"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {agent["api_key"]}'
    }
    payload = {
        'model': agent['endpoint_id'],
        'messages': [
            {'role': 'system', 'content': 'You are an AI assistant'},
            {'role': 'user', 'content': 'Say hello in Thai'}
        ],
        'max_tokens': 50
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.ok:
        data = response.json()
        print(f"✅ Success!")
        print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
    else:
        print(f"❌ Error!")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
