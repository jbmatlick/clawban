#!/bin/bash
# Apply tags with new task IDs

API_URL="https://clawban-production.up.railway.app/api/tasks"
API_KEY="pEQYflodKY8cJ8mF8hdcUTe9yDnzsGUd+UaCVtM05Xk="

# New task IDs from recreation
TASK_IDS=(
  "ReMN0t153lcz-Fy8dEHlT"
  "MERvp4fdkCB08Hp1s1lpE"
  "ph5FegB6Kj0tYBT7XSspa"
  "mp-ZRwUrTYrrG6I7G20Jx"
  "tas2b_C9DVgcQ6HV0KBNK"
  "t5M4HgFsyzh9mSoNWJZrJ"
)

echo "🏷️  Applying 'security' tag..."

for TASK_ID in "${TASK_IDS[@]}"; do
  curl -s -X PATCH "$API_URL/$TASK_ID" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"tags": ["security"]}' > /dev/null
done

echo "📝 Creating authentication task..."

curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Implement authentication for Chatb2b",
    "description": "Set up authentication system:\n- Review chatb2b-web repo\n- Rakesh email context\n- SSO/OAuth options\n- Session management\n- Token refresh\n- Security best practices",
    "status": "new",
    "model_strategy": "opus-planning",
    "estimated_token_cost": 60000,
    "assignee": "rufus",
    "tags": ["chatb2b", "authentication"]
  }' > /dev/null

echo "✅ Done! View at: https://clawban-eight.vercel.app"
