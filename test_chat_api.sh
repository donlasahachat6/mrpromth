#!/bin/bash

# Get session cookie from browser
COOKIE="sb-liywmjxhllpexzrnuhlu-auth-token=YOUR_TOKEN_HERE"

curl -X POST "https://mrpromth-azure.vercel.app/api/chat" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{
    "session_id": "test_session_123",
    "messages": [
      {"role": "user", "content": "สวัสดีครับ"}
    ],
    "mode": "chat",
    "stream": false
  }' \
  -v 2>&1 | head -100
