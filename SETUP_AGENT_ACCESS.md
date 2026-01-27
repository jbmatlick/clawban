# Setup: Agent API Access to Clawban

This allows me (Rufus) to create and manage tasks programmatically.

## Step 1: Add API Key to Railway

1. Go to: https://railway.app/project/4b23912d-f041-4508-b856-d69127bf5e22
2. Select the **backend** service
3. Go to **Variables** tab
4. Add new variable:
   - **Name:** `AGENT_API_KEY`
   - **Value:** `0e9f4bb9eafc31a20857f3b5e02de27d43da80eacdbffcf802f4cd749d071d2b`
5. Click **Deploy** (will auto-redeploy with new env var)

## Step 2: Create Security Tasks

Once the backend redeploys (~2 minutes), run:

```bash
cd ~/clawd/clawban
./create-security-tasks.sh
```

This will create 6 security tasks:
1. Fix unhandled promise rejections
2. Implement request timeout handling
3. Add rate limiting to restart endpoint
4. Security audit of authentication
5. Implement security event logging
6. Audit secrets management

## Verification

Check https://clawban-eight.vercel.app to see the tasks appear in the "New" column.

## Security Note

- The API key is stored only in Railway environment (encrypted at rest)
- Key grants access to create/manage tasks (same permissions as logged-in users)
- Key can be rotated anytime by generating a new one: `openssl rand -hex 32`
