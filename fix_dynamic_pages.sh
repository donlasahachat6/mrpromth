#!/bin/bash

# Find all files that use createClientComponentClient and have 'use client'
FILES=$(grep -r "createClientComponentClient\|createServerComponentClient" app --include="*.tsx" --include="*.ts" | grep -l "'use client'" | sort | uniq)

echo "Found files to fix:"
echo "$FILES"
echo ""

for file in $FILES; do
  # Check if already has dynamic export
  if grep -q "export const dynamic" "$file"; then
    echo "✓ Already fixed: $file"
  else
    # Check if it's a 'use client' file
    if grep -q "'use client'" "$file"; then
      # Add dynamic export after 'use client'
      sed -i "/'use client'/a\\
\\
// Force dynamic rendering\\
export const dynamic = 'force-dynamic'" "$file"
      echo "✓ Fixed: $file"
    fi
  fi
done

echo ""
echo "All files processed!"
