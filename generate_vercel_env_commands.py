#!/usr/bin/env python3
"""
Generate Vercel CLI commands to set environment variables
"""
import json

# Read vanchin_keys.json
with open('vanchin_keys.json', 'r') as f:
    config = json.load(f)

base_url = config['base_url']
agents = config['agents']

print("# Vercel Environment Variable Setup Commands")
print("# Copy and paste these commands into your terminal")
print("# Or run them in Vercel dashboard")
print()
print("# Project: mrpromth")
print("# Team: mrpromths-projects-2aa848c0")
print()
print("=" * 70)
print()

# Base URL
print(f"# 1. Set Base URL")
print(f"vercel env add VANCHIN_BASE_URL production")
print(f"# When prompted, enter: {base_url}")
print()

# All agents
for i, agent in enumerate(agents, 1):
    print(f"# {i+1}. Set Agent {i} - {agent['name']}")
    print(f"vercel env add VANCHIN_API_KEY_{i} production")
    print(f"# When prompted, enter: {agent['api_key']}")
    print(f"vercel env add VANCHIN_ENDPOINT_{i} production")
    print(f"# When prompted, enter: {agent['endpoint_id']}")
    print()

print("=" * 70)
print()
print("# After setting all variables, redeploy:")
print("vercel --prod")
print()
print("# Or trigger redeploy from dashboard:")
print("# https://vercel.com/mrpromths-projects-2aa848c0/mrpromth")
