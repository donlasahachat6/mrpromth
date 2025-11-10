import os
import re

def fix_file(filepath):
    """Fix Rules of Hooks violation by removing early return"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if not using useSupabase
    if 'useSupabase()' not in content:
        return False
    
    # Skip if doesn't have the problematic pattern
    if 'if (!supabase) {\n    return <div>Loading...</div>\n  }' not in content:
        return False
    
    print(f"Fixing: {filepath}")
    
    # Remove the early return
    content = content.replace(
        '  if (!supabase) {\n    return <div>Loading...</div>\n  }',
        ''
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

# Find all files
files = []
for root, dirs, filenames in os.walk('app'):
    for filename in filenames:
        if filename.endswith('.tsx'):
            filepath = os.path.join(root, filename)
            files.append(filepath)

fixed = 0
for file in files:
    if fix_file(file):
        fixed += 1

print(f"\nFixed {fixed} files")
