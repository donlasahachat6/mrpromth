import os
import re

def convert_file(filepath):
    """Convert a file to use useSupabase hook"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already using useSupabase
    if 'useSupabase' in content or 'from \'@/lib/hooks/useSupabase\'' in content:
        return False
    
    # Skip if not using createClientComponentClient
    if 'createClientComponentClient' not in content:
        return False
    
    # Skip if not a client component
    if "'use client'" not in content:
        return False
    
    print(f"Converting: {filepath}")
    
    # Remove old import
    content = re.sub(
        r"import\s+{\s*createClientComponentClient\s*}\s+from\s+['\"]@supabase/auth-helpers-nextjs['\"]",
        "",
        content
    )
    
    # Add new import after 'use client'
    if "from '@/lib/hooks/useSupabase'" not in content:
        content = re.sub(
            r"('use client')",
            r"\1\n\nimport { useSupabase } from '@/lib/hooks/useSupabase'",
            content,
            count=1
        )
    
    # Replace const supabase = createClientComponentClient() with const supabase = useSupabase()
    content = re.sub(
        r"const\s+supabase\s*=\s*createClientComponentClient\(\)",
        "const supabase = useSupabase()",
        content
    )
    
    # Add null check after useSupabase
    # Find the component function and add early return
    if 'const supabase = useSupabase()' in content and 'if (!supabase)' not in content:
        # Add after const supabase = useSupabase()
        content = re.sub(
            r"(const\s+supabase\s*=\s*useSupabase\(\))",
            r"\1\n\n  if (!supabase) {\n    return <div>Loading...</div>\n  }",
            content,
            count=1
        )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

# Find all page files
pages = []
for root, dirs, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            pages.append(filepath)

converted = 0
for page in pages:
    if convert_file(page):
        converted += 1

print(f"\nConverted {converted} files")
