#!/bin/bash

# List of all pages that need dynamic export
PAGES=(
  "app/page.tsx"
  "app/about/page.tsx"
  "app/account-disabled/page.tsx"
  "app/admin/analytics/page.tsx"
  "app/admin/api-keys/page.tsx"
  "app/admin/logs/page.tsx"
  "app/admin/page.tsx"
  "app/admin/rate-limits/page.tsx"
  "app/admin/settings/page.tsx"
  "app/admin/system-logs/page.tsx"
  "app/admin/users/page.tsx"
  "app/agents/page.tsx"
  "app/app/chat/chat_new/page.tsx"
  "app/app/dashboard/page.tsx"
  "app/app/prompts/page.tsx"
  "app/app/settings/page.tsx"
  "app/auth/login/page.tsx"
  "app/auth/signup/page.tsx"
  "app/chat/page.tsx"
  "app/contact/page.tsx"
  "app/dashboard/page.tsx"
  "app/docs/page.tsx"
  "app/examples/page.tsx"
  "app/generate/page.tsx"
  "app/library/page.tsx"
  "app/login/page.tsx"
  "app/privacy/page.tsx"
  "app/production-test/page.tsx"
  "app/projects/page.tsx"
  "app/signup/page.tsx"
  "app/templates/page.tsx"
  "app/terms/page.tsx"
  "app/tutorials/getting-started/page.tsx"
  "app/tutorials/page.tsx"
  "app/unauthorized/page.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    # Check if already has dynamic export
    if ! grep -q "export const dynamic" "$page"; then
      # Add at the top of the file, after imports
      sed -i "1a\\
\\
export const dynamic = 'force-dynamic'" "$page"
      echo "✓ Added to: $page"
    else
      echo "○ Already has: $page"
    fi
  else
    echo "✗ Not found: $page"
  fi
done

echo ""
echo "Done!"
