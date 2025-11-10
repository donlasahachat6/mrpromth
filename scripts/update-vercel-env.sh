#!/bin/bash

# Update Vercel Environment Variables
# This script updates all environment variables for the mrpromth project

PROJECT_ID="prj_K6ap9dV0MFcuG3T2R91cbZyOxQ43"
TEAM_ID="team_HelZgYoQevSEQv5uV4Scnrwc"

echo "🚀 Updating Vercel Environment Variables for mrpromth project..."
echo ""

# Read .env.local and upload to Vercel
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  
  # Remove leading/trailing whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  
  # Skip if value is empty
  [[ -z "$value" ]] && continue
  
  echo "Setting $key..."
  
  # Use Vercel CLI to set environment variable
  vercel env add "$key" production --force --token "$VERCEL_TOKEN" <<EOF
$value
EOF
  
done < .env.local

echo ""
echo "✅ Environment variables updated successfully!"
echo "🔄 Please redeploy your project for changes to take effect."
