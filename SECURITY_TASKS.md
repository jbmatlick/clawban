# Security Tasks for Clawban & Personal Infrastructure

**Created:** 2026-01-26  
**For:** James + Rufus  
**Tag:** security

---

## ✅ Completed

- [x] Set up VPN (James completed)

---

## 🔴 Critical (Do Today)

### 1. Delete Exposed Credential Files
**Assignee:** James  
**Effort:** 5 minutes  
**Risk:** 🔴 CRITICAL

**What to do:**
```bash
# Delete credential files from Downloads
trash ~/Downloads/pgdb.rtf
trash ~/Downloads/supabasekeys.rtf
trash ~/Downloads/*keys*.rtf

# Clear terminal history
history -c
```

**Then:**
- Move all credentials to 1Password/Bitwarden
- Never store credentials in plain text again

---

### 2. Rotate Exposed Database Password
**Assignee:** Rufus  
**Effort:** 15 minutes  
**Risk:** 🔴 CRITICAL

**Steps:**
1. Go to Supabase dashboard
2. Settings → Database → Reset Password
3. Copy new password to password manager
4. Update Railway env var: `DATABASE_URL`
5. Restart Railway deployment
6. Test connection

---

### 3. Enable 2FA on All Critical Accounts
**Assignee:** James  
**Effort:** 30 minutes  
**Risk:** 🔴 CRITICAL

**Enable 2FA on:**
- [ ] GitHub (hardware key or authenticator)
- [ ] Railway
- [ ] Vercel
- [ ] Supabase
- [ ] Gmail
- [ ] Telegram

**Recommended app:** Authy or 1Password

---

### 4. Enable FileVault Encryption
**Assignee:** James  
**Effort:** 5 minutes (then Mac will encrypt overnight)  
**Risk:** 🔴 CRITICAL

**Steps:**
```bash
# Check if enabled
fdesetup status

# If not enabled: System Settings → Privacy & Security → FileVault → Turn On
```

---

## 🟠 High Priority (This Week)

### 5. Set Up Password Manager
**Assignee:** James  
**Effort:** 1 hour  
**Risk:** 🟠 HIGH

**Options:**
- **1Password** ($3/mo, best UX)
- **Bitwarden** (free, open source)

**Migrate:**
- All saved passwords from browser
- Supabase credentials
- Railway tokens
- API keys
- SSH passphrases

---

### 6. Enable Time Machine Backups
**Assignee:** James  
**Effort:** 30 minutes  
**Risk:** 🟠 HIGH

**What you need:**
- External SSD/HDD (1TB+)
- USB cable

**Steps:**
1. Connect drive
2. System Settings → General → Time Machine
3. Select backup disk
4. Turn on encryption
5. Wait for first backup (~2 hours)

---

### 7. Scan Git History for Secrets
**Assignee:** Rufus  
**Effort:** 30 minutes  
**Risk:** 🟠 HIGH

**Run:**
```bash
cd clawban
git log -S "sk-ant" --all        # Anthropic keys
git log -S "supabase" --all      # Supabase keys
git log -S "password" --all      # Passwords
git log -S "AGENT_API_KEY" --all # API keys
```

**If found:**
- Rotate all exposed keys immediately
- Consider using git-filter-repo to remove from history

---

### 8. Add Helmet.js Security Headers
**Assignee:** Rufus  
**Effort:** 15 minutes  
**Risk:** 🟠 HIGH

**Already installed, just need to enable:**
```typescript
// backend/src/index.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

---

### 9. Add Request Size Limits
**Assignee:** Rufus  
**Effort:** 2 minutes  
**Risk:** 🟠 HIGH

**Fix:**
```typescript
// backend/src/index.ts
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));
```

---

### 10. Fix npm Audit Vulnerabilities
**Assignee:** Rufus  
**Effort:** 30 minutes  
**Risk:** 🟡 MEDIUM

**Run:**
```bash
cd clawban/backend && npm audit fix
cd ../frontend && npm audit fix

# Review remaining issues
npm audit
```

---

## 🟡 Medium Priority (This Month)

### 11. Set Up API Key Rotation Schedule
**Assignee:** Rufus  
**Effort:** 1 hour  
**Risk:** 🟡 MEDIUM

**Create:**
- Document all API keys and their locations
- Set expiration dates (90 days)
- Create rotation script
- Add calendar reminders

**File:** `clawban/scripts/rotate-api-keys.sh`

---

### 12. Add Supabase Row-Level Security Policies
**Assignee:** Rufus  
**Effort:** 1 hour  
**Risk:** 🟡 MEDIUM

**Current:** Anyone authenticated can read/write ALL tasks

**Fix:**
```sql
-- Users see only tasks assigned to them or created by them
CREATE POLICY "task_access"
  ON tasks FOR ALL
  USING (
    assignee = auth.user_email() 
    OR created_by = auth.uid()
  );
```

---

### 13. Add Security Monitoring Alerts
**Assignee:** Rufus  
**Effort:** 2 hours  
**Risk:** 🟡 MEDIUM

**Set up:**
- Railway deployment alerts (Telegram)
- Supabase auth failure alerts
- API rate limit breach alerts
- Failed login attempt tracking

---

### 14. Document Incident Response Plan
**Assignee:** Rufus  
**Effort:** 1 hour  
**Risk:** 🟡 MEDIUM

**Create:** `INCIDENT_RESPONSE.md`

**Include:**
- What to do if API key is leaked
- What to do if database is compromised
- What to do if laptop is stolen
- Emergency contact procedures

---

### 15. Review and Restrict CORS Origins
**Assignee:** Rufus  
**Effort:** 15 minutes  
**Risk:** 🟡 MEDIUM

**Update:**
```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://clawban.vercel.app',  // Production only
    ...(process.env.NODE_ENV === 'development' 
      ? ['http://localhost:5173'] 
      : [])
  ],
  credentials: true,
}));
```

---

## 🟢 Low Priority (Nice to Have)

### 16. Add CSRF Protection
**Assignee:** Rufus  
**Effort:** 1 hour

**Install:**
```bash
npm install csurf cookie-parser
```

---

### 17. Migrate from react-beautiful-dnd
**Assignee:** Rufus  
**Effort:** 3 hours

**Why:** Library is deprecated

**Migrate to:** `@hello-pangea/dnd` or `@dnd-kit/core`

---

### 18. Add Security.txt
**Assignee:** Rufus  
**Effort:** 10 minutes

**Create:** `frontend/public/.well-known/security.txt`
```
Contact: mailto:security@chatb2b.com
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: en
```

---

### 19. Enable Dependabot
**Assignee:** Rufus  
**Effort:** 15 minutes

**Create:** `.github/dependabot.yml`
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
```

---

### 20. Add Security Headers Testing
**Assignee:** Rufus  
**Effort:** 30 minutes

**Test with:**
- https://securityheaders.com
- https://observatory.mozilla.org

**Add to CI/CD:**
```bash
npm install --save-dev helmet-csp-reporter
```

---

## Quick Wins (Do Right Now)

### Copy-Paste Fixes

**1. Add helmet.js (30 seconds):**
```typescript
// backend/src/index.ts (already there, just uncomment/enable)
app.use(helmet());
```

**2. Add body size limit (30 seconds):**
```typescript
// backend/src/index.ts
app.use(express.json({ limit: '100kb' }));
```

**3. Add rate limiting (already done ✅)**

---

## Security Checklist Summary

**Today (30 min total):**
- [ ] Delete credential files (5 min)
- [ ] Enable FileVault (5 min)
- [ ] Enable 2FA on 3 most critical accounts (20 min)

**This Week (3 hours total):**
- [ ] Set up password manager (1 hour)
- [ ] Rotate database password (15 min)
- [ ] Enable Time Machine backups (30 min)
- [ ] Scan Git history (30 min)
- [ ] Add helmet.js + body limits (15 min)
- [ ] Fix npm audit issues (30 min)

**This Month (6 hours total):**
- [ ] API key rotation schedule (1 hour)
- [ ] Supabase RLS policies (1 hour)
- [ ] Security monitoring (2 hours)
- [ ] Incident response plan (1 hour)
- [ ] CORS restrictions (15 min)

---

## Cost Summary

**Free:**
- FileVault encryption
- 2FA (Authy app)
- Password manager (Bitwarden free)
- Time Machine backup (have external drive)

**Recommended Paid:**
- 1Password: $3/month
- Backblaze backup: $7/month
- **Total: ~$10/month**

---

## Success Metrics

**Track monthly:**
- Days since last password rotation
- Number of active 2FA-enabled accounts
- npm audit vulnerabilities (should be 0)
- Backup success rate (should be 100%)

---

**Next Action:** James deletes credential files, Rufus adds helmet.js + body limits (2 min fix)
