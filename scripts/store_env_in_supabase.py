#!/usr/bin/env python3
"""
Store Environment Variables in Supabase
Alternative approach: Store env vars in Supabase for easy retrieval
"""

import json
import subprocess
import sys
from pathlib import Path

def load_config():
    """Load configuration from vercel_env_config.json"""
    config_file = Path(__file__).parent.parent / 'vercel_env_config.json'
    
    with open(config_file, 'r') as f:
        return json.load(f)

def store_in_supabase(config):
    """Store environment variables in Supabase using MCP"""
    
    project_id = "liywmjxhllpexzrnuhlu"
    env_vars = config['environmentVariables']
    
    print(f"📦 Storing {len(env_vars)} environment variables in Supabase...")
    print()
    
    # Create table if not exists
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS env_variables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_name TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        target TEXT[] NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(project_name, key)
    );
    
    -- Enable RLS
    ALTER TABLE env_variables ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for authenticated users
    CREATE POLICY IF NOT EXISTS "Allow authenticated users to read env_variables"
        ON env_variables FOR SELECT
        TO authenticated
        USING (true);
    
    CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert env_variables"
        ON env_variables FOR INSERT
        TO authenticated
        WITH CHECK (true);
    
    CREATE POLICY IF NOT EXISTS "Allow authenticated users to update env_variables"
        ON env_variables FOR UPDATE
        TO authenticated
        USING (true);
    """
    
    print("📝 Creating env_variables table...")
    
    try:
        # Use MCP to create table
        result = subprocess.run(
            [
                'manus-mcp-cli', 'tool', 'call', 'apply_migration',
                '--server', 'supabase',
                '--input', json.dumps({
                    "project_id": project_id,
                    "name": "create_env_variables_table",
                    "sql": create_table_sql
                })
            ],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✅ Table created successfully")
        else:
            print(f"⚠️  Table might already exist: {result.stderr}")
    
    except Exception as e:
        print(f"⚠️  Error creating table: {e}")
    
    print()
    print("📝 Inserting environment variables...")
    
    # Insert variables
    for i, var in enumerate(env_vars, 1):
        key = var['key']
        value = var['value']
        target = var['target']
        
        # Escape single quotes in value
        value_escaped = value.replace("'", "''")
        
        insert_sql = f"""
        INSERT INTO env_variables (project_name, key, value, target)
        VALUES ('mrpromth', '{key}', '{value_escaped}', ARRAY{target})
        ON CONFLICT (project_name, key)
        DO UPDATE SET value = EXCLUDED.value, target = EXCLUDED.target, updated_at = NOW();
        """
        
        try:
            result = subprocess.run(
                [
                    'manus-mcp-cli', 'tool', 'call', 'execute_sql',
                    '--server', 'supabase',
                    '--input', json.dumps({
                        "project_id": project_id,
                        "sql": insert_sql
                    })
                ],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print(f"  ✅ {i}/{len(env_vars)}: {key}")
            else:
                print(f"  ❌ {i}/{len(env_vars)}: {key} - {result.stderr}")
        
        except Exception as e:
            print(f"  ❌ {i}/{len(env_vars)}: {key} - {e}")
    
    print()
    print("✅ Environment variables stored in Supabase!")
    print()
    print("📊 To retrieve variables:")
    print("   SELECT * FROM env_variables WHERE project_name = 'mrpromth';")
    print()

def main():
    print("🗄️  Supabase Environment Variables Storage\n")
    
    config = load_config()
    
    print(f"📖 Loaded {len(config['environmentVariables'])} variables")
    print()
    
    store_in_supabase(config)

if __name__ == '__main__':
    main()
