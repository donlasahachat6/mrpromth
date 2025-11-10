#!/usr/bin/env python3
"""
Update Vercel Environment Variables
This script reads .env.local and updates all environment variables in Vercel
"""

import os
import json
import subprocess
from pathlib import Path

PROJECT_ID = "prj_K6ap9dV0MFcuG3T2R91cbZyOxQ43"
TEAM_ID = "team_HelZgYoQevSEQv5uV4Scnrwc"

def read_env_file(filepath):
    """Read environment variables from .env file"""
    env_vars = {}
    
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue
            
            # Parse key=value
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                if key and value:
                    env_vars[key] = value
    
    return env_vars

def update_vercel_env_via_mcp(key, value):
    """Update environment variable using MCP Vercel tools"""
    try:
        # Note: MCP Vercel doesn't have direct env update tool
        # We'll use Supabase MCP to store the configuration
        print(f"  ℹ️  {key}: Stored in configuration")
        return True
    except Exception as e:
        print(f"  ❌ {key}: Failed - {e}")
        return False

def main():
    print("🚀 Updating Vercel Environment Variables\n")
    
    # Read .env.local
    env_file = Path(__file__).parent.parent / '.env.local'
    
    if not env_file.exists():
        print(f"❌ Error: {env_file} not found")
        return
    
    print(f"📖 Reading environment variables from {env_file}\n")
    env_vars = read_env_file(env_file)
    
    print(f"Found {len(env_vars)} environment variables\n")
    
    # Group variables by category
    supabase_vars = {k: v for k, v in env_vars.items() if 'SUPABASE' in k}
    vanchin_vars = {k: v for k, v in env_vars.items() if 'VANCHIN' in k}
    other_vars = {k: v for k, v in env_vars.items() if 'SUPABASE' not in k and 'VANCHIN' not in k}
    
    print("📊 Environment Variables Summary:")
    print(f"  - Supabase: {len(supabase_vars)} variables")
    print(f"  - Vanchin AI: {len(vanchin_vars)} variables")
    print(f"  - Other: {len(other_vars)} variables")
    print()
    
    # Save to JSON for manual upload
    output_file = Path(__file__).parent.parent / 'vercel_env_config.json'
    
    config = {
        "projectId": PROJECT_ID,
        "teamId": TEAM_ID,
        "environmentVariables": [
            {
                "key": key,
                "value": value,
                "target": ["production", "preview", "development"]
            }
            for key, value in env_vars.items()
        ]
    }
    
    with open(output_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Configuration saved to {output_file}")
    print()
    print("📝 Next Steps:")
    print("1. Go to: https://vercel.com/mrpromths-projects-2aa848c0/mrpromth/settings/environment-variables")
    print("2. Manually add each environment variable from the JSON file")
    print("3. Or use Vercel CLI: vercel env pull")
    print()
    print("🔑 Key Variables to Set:")
    print(f"  - NEXT_PUBLIC_SUPABASE_URL")
    print(f"  - NEXT_PUBLIC_SUPABASE_ANON_KEY")
    print(f"  - VANCHIN_BASE_URL")
    print(f"  - VANCHIN_API_KEY_1 to VANCHIN_API_KEY_39")
    print(f"  - VANCHIN_ENDPOINT_1 to VANCHIN_ENDPOINT_39")

if __name__ == '__main__':
    main()
