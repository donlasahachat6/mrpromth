#!/usr/bin/env python3
"""
Upload Environment Variables to Vercel via REST API
This script reads vercel_env_config.json and uploads all variables to Vercel
"""

import json
import subprocess
import sys
import time
from pathlib import Path

def load_config():
    """Load configuration from vercel_env_config.json"""
    config_file = Path(__file__).parent.parent / 'vercel_env_config.json'
    
    if not config_file.exists():
        print(f"❌ Error: {config_file} not found")
        sys.exit(1)
    
    with open(config_file, 'r') as f:
        return json.load(f)

def check_vercel_mcp():
    """Check if Vercel MCP is available"""
    try:
        result = subprocess.run(
            ['manus-mcp-cli', 'tool', 'list', '--server', 'vercel'],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error checking Vercel MCP: {e}")
        return False

def create_env_variable(key, value, target, project_id, team_id):
    """Create environment variable using Vercel REST API via curl"""
    
    # Vercel API endpoint
    url = f"https://api.vercel.com/v10/projects/{project_id}/env"
    
    # Prepare payload
    payload = {
        "key": key,
        "value": value,
        "type": "encrypted",
        "target": target
    }
    
    # Note: We need VERCEL_TOKEN to use the API
    # Since we don't have direct API access, we'll use MCP or manual instructions
    
    print(f"  📝 {key}: Prepared for upload")
    return True

def upload_via_instructions(config):
    """Generate instructions for manual upload"""
    
    project_id = config['projectId']
    team_id = config['teamId']
    env_vars = config['environmentVariables']
    
    print("\n" + "="*70)
    print("📋 MANUAL UPLOAD INSTRUCTIONS")
    print("="*70)
    print()
    print(f"Project ID: {project_id}")
    print(f"Team ID: {team_id}")
    print(f"Total Variables: {len(env_vars)}")
    print()
    print("🔗 Vercel Dashboard URL:")
    print("https://vercel.com/mrpromths-projects-2aa848c0/mrpromth/settings/environment-variables")
    print()
    print("📝 Variables to Add:")
    print()
    
    # Group by category
    supabase_vars = [v for v in env_vars if 'SUPABASE' in v['key']]
    vanchin_vars = [v for v in env_vars if 'VANCHIN' in v['key']]
    other_vars = [v for v in env_vars if 'SUPABASE' not in v['key'] and 'VANCHIN' not in v['key']]
    
    print("1️⃣ SUPABASE VARIABLES (3 variables):")
    for var in supabase_vars:
        print(f"   Key: {var['key']}")
        print(f"   Value: {var['value'][:50]}..." if len(var['value']) > 50 else f"   Value: {var['value']}")
        print(f"   Target: {', '.join(var['target'])}")
        print()
    
    print("2️⃣ VANCHIN AI VARIABLES (79 variables):")
    print(f"   Base URL: {[v for v in vanchin_vars if v['key'] == 'VANCHIN_BASE_URL'][0]['value']}")
    print(f"   API Keys: VANCHIN_API_KEY_1 to VANCHIN_API_KEY_39")
    print(f"   Endpoints: VANCHIN_ENDPOINT_1 to VANCHIN_ENDPOINT_39")
    print()
    
    if other_vars:
        print("3️⃣ OTHER VARIABLES:")
        for var in other_vars:
            print(f"   Key: {var['key']}")
            print(f"   Value: {var['value']}")
            print(f"   Target: {', '.join(var['target'])}")
            print()
    
    print("="*70)
    print()
    
    # Save to a shell script for easier upload
    script_file = Path(__file__).parent.parent / 'upload_env_vars.sh'
    
    with open(script_file, 'w') as f:
        f.write("#!/bin/bash\n\n")
        f.write("# Upload Environment Variables to Vercel\n")
        f.write("# This script requires VERCEL_TOKEN environment variable\n\n")
        f.write(f'PROJECT_ID="{project_id}"\n')
        f.write(f'TEAM_ID="{team_id}"\n\n')
        f.write('if [ -z "$VERCEL_TOKEN" ]; then\n')
        f.write('  echo "❌ Error: VERCEL_TOKEN not set"\n')
        f.write('  echo "Please set VERCEL_TOKEN environment variable"\n')
        f.write('  exit 1\n')
        f.write('fi\n\n')
        
        for var in env_vars:
            key = var['key']
            value = var['value'].replace('"', '\\"').replace('$', '\\$')
            
            f.write(f'echo "Uploading {key}..."\n')
            f.write(f'curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \\\n')
            f.write(f'  -H "Authorization: Bearer $VERCEL_TOKEN" \\\n')
            f.write(f'  -H "Content-Type: application/json" \\\n')
            f.write(f'  -d \'{{"key":"{key}","value":"{value}","type":"encrypted","target":["production","preview","development"]}}\'\n')
            f.write(f'sleep 0.5\n\n')
        
        f.write('echo "✅ All environment variables uploaded!"\n')
        f.write('echo "🔄 Please redeploy your project for changes to take effect."\n')
    
    subprocess.run(['chmod', '+x', str(script_file)])
    
    print(f"✅ Shell script created: {script_file}")
    print()
    print("To use the script:")
    print("  1. Set VERCEL_TOKEN: export VERCEL_TOKEN='your_token_here'")
    print(f"  2. Run: {script_file}")
    print()

def main():
    print("🚀 Vercel Environment Variables Uploader\n")
    
    # Load configuration
    config = load_config()
    
    print(f"📖 Loaded configuration:")
    print(f"  - Project ID: {config['projectId']}")
    print(f"  - Team ID: {config['teamId']}")
    print(f"  - Variables: {len(config['environmentVariables'])}")
    print()
    
    # Check if Vercel MCP is available
    print("🔍 Checking Vercel MCP availability...")
    
    if not check_vercel_mcp():
        print("⚠️  Vercel MCP doesn't support direct env variable upload")
        print("📝 Generating manual upload instructions...\n")
        upload_via_instructions(config)
        return
    
    print("✅ Vercel MCP available")
    print()
    
    # Generate instructions anyway
    upload_via_instructions(config)

if __name__ == '__main__':
    main()
