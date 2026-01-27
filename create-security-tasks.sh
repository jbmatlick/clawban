#!/bin/bash
# Create security tasks in Clawban
# Usage: Set AGENT_API_KEY in Railway first, then run this script

API_URL="https://clawban-production.up.railway.app/api/tasks"
API_KEY="pEQYflodKY8cJ8mF8hdcUTe9yDnzsGUd+UaCVtM05Xk="

echo "Creating security tasks..."

# Task 1: Fix unhandled promise rejections
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Fix unhandled promise rejections in gateway",
    "description": "Add proper try/catch around API calls to prevent AbortError crashes. Focus on:\n- Anthropic API calls\n- HTTP fetch operations\n- WebSocket operations\n\nRoot cause: Aborted operations not caught → process crashes",
    "status": "new",
    "model_strategy": "opus-coding",
    "estimated_token_cost": 50000,
    "assignee": "rufus"
  }'

echo ""

# Task 2: Add request timeout handling
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Implement request timeout handling",
    "description": "Add configurable timeouts to all external HTTP requests:\n- Default timeout: 30s\n- Graceful degradation on timeout\n- Retry logic with exponential backoff\n- Circuit breaker pattern for failing services",
    "status": "new",
    "model_strategy": "sonnet-coding",
    "estimated_token_cost": 30000,
    "assignee": "rufus"
  }'

echo ""

# Task 3: Add rate limiting to gateway endpoints
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Add rate limiting to gateway restart endpoint",
    "description": "Prevent abuse of gateway restart functionality:\n- Max 3 restarts per hour\n- Log all restart attempts with IP/user\n- Add cooldown period after restart\n- Send notification on suspicious activity",
    "status": "new",
    "model_strategy": "sonnet-coding",
    "estimated_token_cost": 20000,
    "assignee": "rufus"
  }'

echo ""

# Task 4: Security audit of Clawban auth
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Security audit: Clawban authentication",
    "description": "Review and harden authentication:\n- Verify Supabase JWT validation\n- Check API key storage (Railway env vars)\n- Review CORS configuration\n- Test auth bypass scenarios\n- Add security headers audit\n- Check for SQL injection vectors",
    "status": "new",
    "model_strategy": "opus-planning",
    "estimated_token_cost": 40000,
    "assignee": "rufus"
  }'

echo ""

# Task 5: Add security logging
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Implement security event logging",
    "description": "Add comprehensive security logging:\n- Failed auth attempts\n- Unauthorized access attempts\n- Rate limit violations\n- Gateway restart events\n- Suspicious activity patterns\n- Log retention: 90 days\n- Daily security report summary",
    "status": "new",
    "model_strategy": "sonnet-coding",
    "estimated_token_cost": 25000,
    "assignee": "rufus"
  }'

echo ""

# Task 6: Secrets management review
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "Audit secrets management",
    "description": "Review all secrets and credentials:\n- API keys (Anthropic, Supabase, Gateway)\n- Database credentials\n- OAuth tokens (Telegram, Gmail, GitHub)\n- Ensure no secrets in git history\n- Rotate any exposed keys\n- Document secret rotation procedure\n- Add secrets scanning to CI/CD",
    "status": "new",
    "model_strategy": "opus-planning",
    "estimated_token_cost": 30000,
    "assignee": "rufus"
  }'

echo ""
echo "✅ Security tasks created!"
