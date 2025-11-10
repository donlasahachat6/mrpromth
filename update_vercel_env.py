#!/usr/bin/env python3
"""
Update Vercel environment variables with correct Vanchin API keys
"""
import json
import os
import sys
import requests

PROJECT_ID = "prj_K6ap9dV0MFcuG3T2R91cbZyOxQ43"
TEAM_ID = "team_HelZgYoQevSEQv5uV4Scnrwc"

# Get Vercel token from environment
VERCEL_TOKEN = os.environ.get('VERCEL_TOKEN')
if not VERCEL_TOKEN:
    print("❌ Error: VERCEL_TOKEN environment variable not set")
    sys.exit(1)

# Read vanchin_keys.json
with open('vanchin_keys.json', 'r') as f:
    vanchin_config = json.load(f)

base_url = vanchin_config['base_url']
agents = vanchin_config['agents']

print(f"Updating Vercel environment variables...")
print(f"Project: {PROJECT_ID}")
print(f"Team: {TEAM_ID}")
print(f"Base URL: {base_url}")
print(f"Agents: {len(agents)}")
print("-" * 60)

# Vercel API endpoint
api_url = f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env"
headers = {
    'Authorization': f'Bearer {VERCEL_TOKEN}',
    'Content-Type': 'application/json'
}
params = {'teamId': TEAM_ID}

def create_or_update_env(key, value):
    """Create or update an environment variable"""
    # First, try to get existing env var
    get_url = f"{api_url}/{key}"
    response = requests.get(get_url, headers=headers, params=params)
    
    data = {
        'key': key,
        'value': value,
        'type': 'encrypted',
        'target': ['production', 'preview', 'development']
    }
    
    if response.status_code == 200:
        # Update existing
        env_id = response.json().get('id')
        if env_id:
            update_url = f"{api_url}/{env_id}"
            response = requests.patch(update_url, headers=headers, params=params, json=data)
            if response.ok:
                print(f"  ✅ Updated {key}")
                return True
            else:
                print(f"  ⚠️  Failed to update {key}: {response.text}")
                return False
    
    # Create new
    response = requests.post(api_url, headers=headers, params=params, json=data)
    if response.ok:
        print(f"  ✅ Created {key}")
        return True
    else:
        print(f"  ⚠️  Failed to create {key}: {response.text}")
        return False

# Update base URL
print("\n[1/15] Setting VANCHIN_BASE_URL...")
create_or_update_env('VANCHIN_BASE_URL', base_url)

# Update all agents
for i, agent in enumerate(agents, 1):
    print(f"\n[{i+1}/15] Setting Agent {i} ({agent['name']})...")
    create_or_update_env(f'VANCHIN_API_KEY_{i}', agent['api_key'])
    create_or_update_env(f'VANCHIN_ENDPOINT_{i}', agent['endpoint_id'])

print("\n" + "=" * 60)
print("✅ Environment variables update completed!")
print("\nNote: Vercel will automatically redeploy when env vars change.")
print("Check deployment status at: https://vercel.com/mrpromths-projects-2aa848c0/mrpromth")
