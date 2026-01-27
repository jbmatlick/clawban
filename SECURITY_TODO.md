# Security Todo List - Clawban & Rufus Operations

**Created:** 2026-01-26  
**Priority:** 🔴 CRITICAL  
**Owner:** James + Rufus

---

## 🚨 Critical Security Gaps (Fix Immediately)

### 1. Exposed Database Credentials ❌
**Status:** 🔴 CRITICAL  
**Risk:** Database credentials stored in plain text in Downloads folder

**Found:**
- `~/Downloads/pgdb.rtf` - Contains PostgreSQL password
- `~/Downloads/supabasekeys.rtf` - Contains Supabase keys
- These files are visible in chat logs and terminal history

**Fix:**
- [ ] Delete `~/Downloads/pgdb.rtf` immediately
- [ ] Delete `~/Downloads/supabasekeys.rtf` immediately  
- [ ] Use password manager (1Password/Bitwarden) for all credentials
- [ ] Rotate database password (generate new one in Supabase)
- [ ] Update Railway environment variables with new password
- [ ] Never store credentials in plain text files again

**How to do it safely:**
```bash
# Delete the files
trash ~/Downloads/pgdb.rtf
trash ~/Downloads/supabasekeys.rtf

# Clear terminal history of passwords
history -c
```

---

### 2. API Keys in Git History ⚠️
**Status:** 🟠 HIGH RISK  
**Risk:** API keys and secrets may be in Git commits

**Check:**
- [ ] Review all commits for accidentally committed `.env` files
- [ ] Search repo for hardcoded keys: `git log -S "sk-ant" --all`
- [ ] Search repo for passwords: `git log -S "password" --all`
- [ ] Use `gitleaks` or `trufflehog` to scan for secrets

**If found:**
- [ ] Rotate all exposed keys immediately
- [ ] Use `git filter-repo` to remove from history (nuclear option)
- [ ] Force push cleaned history
- [ ] Add `.env` to `.gitignore` (already done, but verify)

---

### 3. No VPN for Development ❌
**Status:** 🟠 HIGH RISK  
**Risk:** All API calls, database connections, and work done over public internet

**Your computer:**
- **Home network:** Potentially exposed to ISP monitoring
- **Coffee shop WiFi:** Extremely vulnerable to man-in-the-middle attacks
- **No VPN:** All traffic visible to network operators

**Fix:**
- [ ] Install VPN client (recommend: **Mullvad**, **ProtonVPN**, or **Tailscale**)
- [ ] Enable VPN for all development work
- [ ] Use VPN whenever on public WiFi
- [ ] Consider split-tunnel mode (VPN for work, direct for streaming)

**Recommended VPNs:**
| VPN | Privacy | Speed | Cost | Best For |
|-----|---------|-------|------|----------|
| **Mullvad** | ⭐⭐⭐⭐⭐ | Fast | €5/mo | Privacy-first |
| **ProtonVPN** | ⭐⭐⭐⭐⭐ | Fast | Free tier | Budget + privacy |
| **Tailscale** | ⭐⭐⭐⭐ | Very fast | Free | Private networks |

---

### 4. Telegram Bot Token Exposed ⚠️
**Status:** 🟡 MEDIUM RISK  
**Risk:** If bot token leaks, anyone can impersonate Rufus

**Current:**
- Bot token likely in Clawdbot config
- May be in terminal history or logs

**Fix:**
- [ ] Verify bot token is NOT in Git repo
- [ ] Store token in Railway/Clawdbot secure config only
- [ ] Enable Telegram bot restrictions (only respond to your user ID)
- [ ] Rotate bot token if ever exposed

---

## 🔐 Infrastructure Security

### 5. Railway Environment Variables ✅ (Partially Complete)
**Status:** 🟢 GOOD (but verify)  
**What's secure:**
- ✅ Environment variables encrypted at rest
- ✅ Not visible in logs
- ✅ Only accessible to Railway project

**Verify:**
- [ ] Check Railway doesn't log env vars in build logs
- [ ] Confirm `DATABASE_URL` not printed to console anywhere
- [ ] Remove any `console.log(process.env)` statements

---

### 6. Supabase Security ⚠️
**Status:** 🟡 MEDIUM (needs review)  
**Current setup:**
- Row-level security (RLS) enabled but permissive
- Anyone authenticated can read/write all tasks
- Service key stored in Railway (good)
- Anon key in frontend (expected, but limited)

**Fix:**
- [ ] Review RLS policies in Supabase
- [ ] Restrict policies to user-owned data (when multi-user)
- [ ] Enable MFA on Supabase account
- [ ] Review Supabase audit logs monthly
- [ ] Set up Supabase project alerts

**RLS Policy Improvements:**
```sql
-- Example: Only show user their own tasks (future)
CREATE POLICY "Users see own tasks"
  ON tasks FOR SELECT
  USING (created_by = auth.uid() OR assignee = auth.user_email());
```

---

### 7. API Key Security ⚠️
**Status:** 🟡 MEDIUM  
**Current:**
- `AGENT_API_KEY` grants full access (no scoping)
- No key rotation policy
- No rate limiting per key
- Single key for all agents

**Fix:**
- [ ] Document key rotation schedule (quarterly)
- [ ] Add key expiration dates
- [ ] Implement per-key rate limiting
- [ ] Add key usage logging/auditing
- [ ] Consider multiple keys (one per agent/environment)

**Future enhancement:**
```typescript
// Add key metadata
{
  key: "rufus_prod_abc123",
  agent: "rufus",
  environment: "production",
  created: "2026-01-26",
  expires: "2026-04-26",
  permissions: ["tasks:read", "tasks:write"],
  rate_limit: 100
}
```

---

## 💻 Computer & Operational Security

### 8. MacBook Security ⚠️
**Status:** 🟡 MEDIUM (needs verification)

**Check:**
- [ ] FileVault encryption enabled? (full disk encryption)
- [ ] Automatic login disabled?
- [ ] Screen lock timeout set (< 5 minutes)?
- [ ] Firewall enabled?
- [ ] Automatic updates enabled?
- [ ] Password-protected firmware?

**Verify:**
```bash
# Check FileVault status
fdesetup status

# Check firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Check screen lock settings
defaults read com.apple.screensaver askForPassword
```

---

### 9. SSH Keys ⚠️
**Status:** 🟡 MEDIUM (needs verification)

**Check:**
- [ ] SSH keys password-protected?
- [ ] Using ed25519 keys (not RSA)?
- [ ] GitHub/GitLab keys separate from server keys?
- [ ] Old/unused keys removed from `~/.ssh/`?

**Best practice:**
```bash
# Generate new secure key
ssh-keygen -t ed25519 -C "james@chatb2b.com"

# Add passphrase when prompted
# Use ssh-agent to avoid re-entering constantly
```

---

### 10. Browser Security ⚠️
**Status:** 🟡 MEDIUM

**Check:**
- [ ] Using password manager (not browser save)?
- [ ] HTTPS Everywhere / HTTPS-Only mode?
- [ ] Ad blocker installed (blocks tracking)?
- [ ] Cookie auto-delete on close (optional)?
- [ ] Different browser profiles (work vs personal)?

**Recommended extensions:**
- uBlock Origin (ad/tracker blocking)
- Privacy Badger (tracker blocking)
- 1Password / Bitwarden (password manager)

---

### 11. Backup Security ❌
**Status:** 🔴 CRITICAL (no backups!)

**Current state:**
- No mention of Time Machine backups
- No cloud backup strategy
- Work laptop = single point of failure

**Fix:**
- [ ] Enable Time Machine to external drive (encrypted)
- [ ] Enable iCloud backup (selective - not sensitive files)
- [ ] Consider Backblaze for cloud backup (encrypted)
- [ ] Exclude `.env` files from cloud backups
- [ ] Test restore procedure quarterly

---

## 🔒 Authentication & Access Control

### 12. Password Security ⚠️
**Status:** 🟡 MEDIUM (assumed needs improvement)

**Fix:**
- [ ] Use password manager (1Password, Bitwarden, etc.)
- [ ] Generate unique passwords for every service
- [ ] Enable MFA on ALL critical services:
  - [ ] GitHub
  - [ ] Railway
  - [ ] Vercel
  - [ ] Supabase
  - [ ] Gmail
  - [ ] Telegram (if available)
- [ ] Use hardware key (YubiKey) for highest-value accounts

---

### 13. Session Management ⚠️
**Status:** 🟡 MEDIUM

**Check:**
- [ ] How long do Supabase JWT tokens last?
- [ ] Railway CLI sessions - do they expire?
- [ ] Vercel CLI auth token expiration?
- [ ] GitHub personal access tokens scoped correctly?

**Fix:**
- [ ] Set Supabase JWT expiration (default 1 hour is good)
- [ ] Regularly audit active sessions
- [ ] Revoke old/unused tokens
- [ ] Use short-lived tokens where possible

---

## 📡 Communication Security

### 14. Telegram Security ✅ (Mostly Good)
**Status:** 🟢 GOOD (with notes)

**What's secure:**
- ✅ End-to-end encryption for Secret Chats
- ✅ 2FA available
- ⚠️ Regular chats encrypted in transit but stored on Telegram servers

**Verify:**
- [ ] 2FA enabled on Telegram account
- [ ] Session list reviewed (terminate unknown devices)
- [ ] Consider using Secret Chats for sensitive info
- [ ] Bot conversations are NOT end-to-end encrypted (by design)

---

### 15. Email Security ⚠️
**Status:** 🟡 MEDIUM

**Current:**
- Gmail API access granted to Clawdbot
- OAuth tokens stored somewhere (verify where)

**Check:**
- [ ] Where are Gmail OAuth tokens stored?
- [ ] Are tokens encrypted?
- [ ] Read-only scope (gmail.readonly) or full access?
- [ ] Review OAuth permissions in Google Account settings
- [ ] Enable Gmail 2FA

---

## 🗄️ Data Security

### 16. Data Encryption at Rest ⚠️
**Status:** 🟡 MEDIUM

**Current state:**
- ✅ Railway: Encrypted at rest
- ✅ Supabase: Encrypted at rest
- ✅ Vercel: Encrypted at rest
- ⚠️ Local files: Depends on FileVault

**Verify:**
- [ ] FileVault enabled (full disk encryption)
- [ ] External drives encrypted
- [ ] Cloud storage encrypted (iCloud, Google Drive)

---

### 17. Secrets Management ❌
**Status:** 🔴 CRITICAL

**Current:**
- `.env` files in repo (gitignored, but risky)
- Secrets stored in Railway (good)
- Secrets may be in terminal history
- Secrets in Downloads folder (bad!)

**Fix:**
- [ ] Use dedicated secrets manager (Doppler, Infisical, or 1Password)
- [ ] Never store secrets in plain text files
- [ ] Use Railway CLI for secret injection (not .env locally)
- [ ] Clear terminal history after pasting secrets
- [ ] Add `.env*` to global gitignore

**Better workflow:**
```bash
# Instead of .env file, use Railway CLI:
railway run npm run dev  # Injects secrets from Railway

# Or use a secrets manager:
doppler run -- npm run dev
```

---

## 🛡️ Monitoring & Incident Response

### 18. Security Monitoring ❌
**Status:** 🔴 NONE

**Missing:**
- No alerts for suspicious logins
- No monitoring for API key abuse
- No audit log review process
- No intrusion detection

**Fix:**
- [ ] Enable login notifications (GitHub, Railway, Supabase)
- [ ] Set up API rate limit alerts
- [ ] Review Supabase auth logs weekly
- [ ] Set up failed login attempt alerts
- [ ] Monitor for unusual database queries

---

### 19. Incident Response Plan ❌
**Status:** 🔴 NONE

**What happens if:**
- API key is leaked?
- Database is compromised?
- Laptop is stolen?
- Telegram bot is hijacked?

**Fix:**
- [ ] Document incident response procedures
- [ ] Create key rotation checklist
- [ ] Backup contact methods (SMS, email, Signal)
- [ ] Test response procedures quarterly

**Emergency Response Checklist:**
```markdown
If API key is compromised:
1. Generate new key in Railway
2. Update AGENT_API_KEY env var
3. Deploy immediately
4. Review logs for unauthorized access
5. Notify affected parties if data accessed

If laptop is stolen:
1. Change all passwords immediately
2. Revoke GitHub/Railway/Vercel sessions
3. Contact employer/insurance
4. Remote wipe if Find My Mac enabled
5. Rotate all SSH keys
```

---

## 🏗️ Code Security

### 20. Dependency Security ⚠️
**Status:** 🟡 MEDIUM

**Current:**
- `npm audit` shows 7 moderate vulnerabilities
- No automated dependency updates
- No security scanning in CI/CD

**Fix:**
- [ ] Run `npm audit fix` on backend and frontend
- [ ] Review remaining vulnerabilities
- [ ] Set up Dependabot (GitHub automated PRs)
- [ ] Add `npm audit` to CI/CD pipeline
- [ ] Review dependencies quarterly

---

### 21. Input Validation ✅ (Good)
**Status:** 🟢 GOOD

**Current:**
- ✅ express-validator on all inputs
- ✅ Prisma prevents SQL injection
- ✅ Rate limiting enabled
- ✅ Request size limits (1MB)

**Verify:**
- [ ] All user inputs validated
- [ ] File uploads sanitized (when added)
- [ ] No `eval()` or `Function()` usage
- [ ] XSS protection in frontend

---

## 📋 Security Checklist (Priority Order)

### 🔴 Do Today (Critical)

- [ ] **Delete credential files** from Downloads
- [ ] **Rotate database password** in Supabase
- [ ] **Enable FileVault** on MacBook
- [ ] **Install VPN** (Mullvad or ProtonVPN)
- [ ] **Enable 2FA** on all critical accounts:
  - [ ] GitHub
  - [ ] Railway
  - [ ] Vercel
  - [ ] Supabase
  - [ ] Gmail
- [ ] **Clear terminal history** of any passwords

### 🟠 This Week (High Priority)

- [ ] Set up password manager (1Password or Bitwarden)
- [ ] Move all passwords to password manager
- [ ] Enable Time Machine backups
- [ ] Review and restrict Supabase RLS policies
- [ ] Document API key rotation schedule
- [ ] Scan Git history for leaked secrets
- [ ] Run `npm audit fix` on all projects

### 🟡 This Month (Medium Priority)

- [ ] Create incident response plan
- [ ] Set up security monitoring alerts
- [ ] Enable Dependabot for automated updates
- [ ] Review SSH keys, remove old ones
- [ ] Audit active sessions on all platforms
- [ ] Set up backup verification process
- [ ] Consider hardware security key (YubiKey)

### 🟢 Ongoing (Best Practices)

- [ ] Weekly: Review Supabase auth logs
- [ ] Monthly: Rotate sensitive credentials
- [ ] Quarterly: Full security audit
- [ ] Quarterly: Test backup restore
- [ ] Quarterly: Review dependency vulnerabilities
- [ ] Annually: Comprehensive penetration test

---

## 🎯 Security Metrics

**Track these monthly:**
- Number of active API keys
- Failed login attempts
- Dependency vulnerabilities (count)
- Days since last credential rotation
- Backup success rate
- Unpatched security issues

---

## 💰 Security Budget

**Free:**
- VPN (ProtonVPN free tier)
- Password manager (Bitwarden free tier)
- FileVault (built-in)
- 2FA apps (Google Authenticator, Authy)

**Paid (recommended):**
- Password manager pro: ~$3-5/month
- VPN: ~$5-10/month
- Backup service (Backblaze): ~$7/month
- Hardware key (YubiKey): ~$25-50 one-time
- **Total: ~$15-25/month**

---

## 📚 Resources

**Tools:**
- [gitleaks](https://github.com/gitleaks/gitleaks) - Scan for secrets in Git
- [trufflehog](https://github.com/trufflesecurity/trufflehog) - Find credentials in code
- [Dependabot](https://github.com/dependabot) - Automated dependency updates

**Guides:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web app security
- [Security Checklist by Cloudflare](https://www.cloudflare.com/learning/security/glossary/security-checklist/)

---

## ✅ When Complete

This list should become a **living document**:
- Review quarterly
- Update after each incident
- Add new threats as discovered
- Track completion rate

**Goal:** 100% of critical items complete within 7 days.

---

**Next Action:** Start with the 🔴 Critical section - delete those credential files NOW!
