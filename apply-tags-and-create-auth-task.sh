#!/bin/bash
# Apply tags to existing tasks and create authentication task

API_URL="https://clawban-production.up.railway.app/api/tasks"
API_KEY="pEQYflodKY8cJ8mF8hdcUTe9yDnzsGUd+UaCVtM05Xk="

echo "📦 Fetching existing tasks..."

# Get all tasks assigned to Rufus
TASKS=$(curl -s "$API_URL?assignee=rufus" \
  -H "X-API-Key: $API_KEY" | jq -r '.data.tasks[] | @json')

echo "🏷️  Applying 'security' tag to existing tasks..."

# Apply 'security' tag to each task
echo "$TASKS" | while IFS= read -r task; do
  TASK_ID=$(echo "$task" | jq -r '.id')
  TASK_TITLE=$(echo "$task" | jq -r '.title')
  
  echo "  → $TASK_TITLE"
  
  curl -s -X PATCH "$API_URL/$TASK_ID" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"tags": ["security"]}' > /dev/null
done

echo ""
echo "📝 Creating authentication task..."

# Create new authentication task
curl -s -X POST "$API_URL" \
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
  }' | jq -r '.data.title'

echo ""
echo "✅ Tags applied and authentication task created!"
echo ""
echo "📊 View tasks at: https://clawban-eight.vercel.app"
