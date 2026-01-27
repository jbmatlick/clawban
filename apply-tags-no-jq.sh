#!/bin/bash
# Apply tags to existing tasks and create authentication task (no jq required)

API_URL="https://clawban-production.up.railway.app/api/tasks"
API_KEY="pEQYflodKY8cJ8mF8hdcUTe9yDnzsGUd+UaCVtM05Xk="

echo "📦 Fetching existing tasks..."

# Get all tasks (simple approach - update all rufus-assigned tasks)
TASK_IDS=(
  "kfbn8g927wH0AcylxKCqc"
  "PMHpk_4iasbKkTHrXlp8b"
  "r1QDfjNjva3GnvYu7-wpU"
  "pmdPzT99wabCCKJQEb9yd"
  "Dx7VHAmHyOw0eHs74kohx"
  "blLQqokqx2V8e92ADocFH"
)

TASK_TITLES=(
  "Fix unhandled promise rejections"
  "Implement request timeout handling"
  "Add rate limiting to restart endpoint"
  "Security audit: authentication"
  "Implement security event logging"
  "Audit secrets management"
)

echo "🏷️  Applying 'security' tag to ${#TASK_IDS[@]} existing tasks..."

for i in "${!TASK_IDS[@]}"; do
  TASK_ID="${TASK_IDS[$i]}"
  TASK_TITLE="${TASK_TITLES[$i]}"
  
  echo "  → $TASK_TITLE"
  
  curl -s -X PATCH "$API_URL/$TASK_ID" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"tags": ["security"]}' > /dev/null
done

echo ""
echo "📝 Creating authentication task..."

# Create new authentication task
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Implement authentication for Chatb2b",
    "description": "Set up authentication system for Chatb2b platform:\n\n**Requirements:**\n- Review existing auth in chatb2b-web repo\n- Rakesh email context: auth setup needed\n- Implement secure authentication flow\n- Consider SSO/OAuth options\n- User session management\n- Token refresh mechanism\n- Security best practices\n\n**Repos:**\n- chatb2b-web\n- chatb2b-api (if needed)",
    "status": "new",
    "model_strategy": "opus-planning",
    "estimated_token_cost": 60000,
    "assignee": "rufus",
    "tags": ["chatb2b", "authentication"]
  }')

echo "$RESPONSE" | grep -q '"success":true' && echo "✓ Created: Implement authentication for Chatb2b"

echo ""
echo "✅ Tags applied and authentication task created!"
echo ""
echo "📊 View tasks at: https://clawban-eight.vercel.app"
