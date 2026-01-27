# Security Backlog - Comprehensive Protection Plan

**Created:** 2026-01-26  
**Purpose:** Prevent data theft and project hacking  
**Based on:** OWASP Top 10 2024, NIST guidelines, industry best practices

---

## 🎯 Security Goals

1. **No data breaches** - Prevent unauthorized access to data
2. **No account takeovers** - Protect all login credentials
3. **No code injection** - Prevent malicious code execution
4. **No service disruption** - Maintain availability
5. **Audit trail** - Know what happened and when

---

## 🔴 P0 - Critical Vulnerabilities (Fix Immediately)

### Authentication & Access Control

#### 1. Add JWT Authentication to Clawban API
**Risk:** 🔴 CRITICAL - Anyone can access/delete all tasks  
**Effort:** 3 hours  
**Assignee:** Rufus

**Current state:** No authentication at all  
**Impact:** Complete data breach possible

**Implementation:**
```typescript
// Use Supabase Auth (already have it for frontend)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  
  req.user = user;
  next();
};

app.use('/api/tasks', requireAuth, taskRoutes);
```

**Test:**
- Try accessing API without token → 401
- Try with expired token → 401
- Try with valid token → 200

---

#### 2. Implement Row-Level Security (RLS) in Supabase
**Risk:** 🔴 CRITICAL - Users can see each other's tasks  
**Effort:** 1 hour  
**Assignee:** Rufus

**Current state:** Anyone authenticated can read/write ALL data

**SQL policies to add:**
```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see tasks assigned to them
CREATE POLICY "Users see own tasks"
  ON tasks FOR SELECT
  USING (
    assignee = auth.jwt() ->> 'email'
    OR created_by = auth.uid()
  );

-- Users can only create tasks
CREATE POLICY "Users create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users can only update own tasks
CREATE POLICY "Users update own tasks"
  ON tasks FOR UPDATE
  USING (
    assignee = auth.jwt() ->> 'email'
    OR created_by = auth.uid()
  );

-- Users can only delete own tasks
CREATE POLICY "Users delete own tasks"
  ON tasks FOR DELETE
  USING (created_by = auth.uid());
```

---

#### 3. Rotate All Exposed Credentials
**Risk:** 🔴 CRITICAL - Database credentials in plain text files  
**Effort:** 30 minutes  
**Assignee:** James + Rufus

**Steps:**
1. **Supabase database password** (Rufus)
   - Generate new password in Supabase
   - Update Railway `DATABASE_URL`
   - Test connection
   
2. **AGENT_API_KEY** (Rufus)
   - Generate new: `openssl rand -hex 32`
   - Update Railway env var
   - Restart deployment
   
3. **Supabase project keys** (Rufus)
   - Reset in Supabase dashboard
   - Update all deployments
   
4. **GitHub personal access tokens** (James)
   - Revoke old tokens
   - Create new with minimal scopes
   
5. **Railway tokens** (James)
   - Revoke old CLI tokens
   - Generate new

---

#### 4. Enable 2FA on ALL Accounts
**Risk:** 🔴 CRITICAL - Account takeover via password alone  
**Effort:** 30 minutes  
**Assignee:** James

**Enable 2FA on:**
- [ ] GitHub (use hardware key if possible)
- [ ] Railway
- [ ] Vercel
- [ ] Supabase
- [ ] Gmail (james@chatb2b.com)
- [ ] Telegram
- [ ] Notion
- [ ] 1Password/Bitwarden (if using)
- [ ] Apple ID
- [ ] Domain registrar (important!)

**Best practices:**
- Use authenticator app (Authy, 1Password)
- Save backup codes in secure location
- Consider hardware key (YubiKey) for GitHub/Gmail

---

### Secrets Management

#### 5. Move All Secrets to Password Manager
**Risk:** 🔴 CRITICAL - Secrets in plain text files  
**Effort:** 1 hour  
**Assignee:** James

**Current issues:**
- Credentials in Downloads folder
- Secrets in terminal history
- Passwords saved in browsers

**Action plan:**
1. Install password manager (1Password or Bitwarden)
2. Import all saved browser passwords
3. Add all API keys, database credentials
4. Delete plain text credential files
5. Clear terminal history: `history -c && history -w`

---

#### 6. Scan Git Repos for Leaked Secrets
**Risk:** 🔴 CRITICAL - Secrets in Git history  
**Effort:** 1 hour  
**Assignee:** Rufus

**Use automated tools:**
```bash
# Install gitleaks
brew install gitleaks

# Scan all repos
cd clawban && gitleaks detect --verbose
cd chatb2b-web && gitleaks detect --verbose
cd chatb2b-api && gitleaks detect --verbose

# If secrets found, rotate immediately
```

**Also scan for:**
- `sk-ant` (Anthropic keys)
- `password=`
- `secret=`
- `token=`
- Email addresses
- Private keys

---

### Infrastructure Security

#### 7. Enable FileVault Full Disk Encryption
**Risk:** 🔴 CRITICAL - Laptop theft = data breach  
**Effort:** 5 minutes (+ overnight encryption)  
**Assignee:** James

**Steps:**
```bash
# Check status
fdesetup status

# If not enabled:
# System Settings → Privacy & Security → FileVault → Turn On
```

**Important:**
- Write down recovery key
- Store recovery key in password manager
- Never lose recovery key (can't recover data without it)

---

#### 8. Set Up Encrypted Backups
**Risk:** 🔴 CRITICAL - Data loss = project loss  
**Effort:** 1 hour  
**Assignee:** James

**Backup strategy:**
1. **Local:** Time Machine to encrypted external drive
2. **Cloud:** Backblaze (end-to-end encrypted)
3. **Code:** Git (but never commit secrets)

**Time Machine setup:**
- Connect external SSD (1TB+)
- Enable encryption
- Exclude: Downloads, node_modules, .env files
- Test restore procedure

**Backblaze setup:**
- Sign up: $7/month
- Install client
- Enable encryption (set personal key)
- Exclude sensitive folders

---

## 🟠 P1 - High Risk (This Week)

### API Security

#### 9. Add Rate Limiting Per User/Key
**Risk:** 🟠 HIGH - API abuse, DoS  
**Effort:** 2 hours  
**Assignee:** Rufus

**Current:** Global rate limit (100 req/15min)  
**Needed:** Per-user/per-key limits

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const perUserLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000, // 1 minute
  max: async (req) => {
    // Different limits for different users
    if (req.user?.role === 'admin') return 1000;
    if (req.user?.role === 'agent') return 100;
    return 10; // Default
  },
  keyGenerator: (req) => req.user?.id || req.ip,
});
```

**Also add:**
- Slower rate limit for write operations
- Exponential backoff for failed auth attempts
- IP-based blocking for brute force

---

#### 10. Implement API Key Rotation Policy
**Risk:** 🟠 HIGH - Long-lived keys increase breach window  
**Effort:** 2 hours  
**Assignee:** Rufus

**Create system for:**
- Key expiration (90 days)
- Key usage logging
- Automatic key rotation
- Key revocation

**Database schema:**
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  key_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  permissions JSONB,
  rate_limit INTEGER DEFAULT 100
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at);
```

---

#### 11. Add Request/Response Logging & Auditing
**Risk:** 🟠 HIGH - No forensics if breach occurs  
**Effort:** 3 hours  
**Assignee:** Rufus

**Log:**
- All authentication attempts (success/failure)
- All data access (who, what, when)
- All modifications (who changed what)
- All deletions (who deleted what)
- All failed authorization attempts

**Tools:**
- Winston (already have it)
- Logtail or Datadog for aggregation
- Set up alerts for suspicious patterns

**Example:**
```typescript
logger.info('Task access', {
  userId: req.user.id,
  taskId: req.params.id,
  action: 'read',
  ip: req.ip,
  userAgent: req.headers['user-agent'],
});
```

---

#### 12. Add Input Sanitization Layer
**Risk:** 🟠 HIGH - XSS, injection attacks  
**Effort:** 2 hours  
**Assignee:** Rufus

**Beyond validation, sanitize:**
```typescript
import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

// Middleware to sanitize all string inputs
const sanitizeInputs = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove HTML tags but preserve markdown
        obj[key] = sanitizeHtml(obj[key], {
          allowedTags: [], // Strip all HTML
          allowedAttributes: {},
        });
        
        // Escape special chars
        obj[key] = validator.escape(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  next();
};

app.use(sanitizeInputs);
```

---

### Code Security

#### 13. Set Up Dependabot & Automated Security Scanning
**Risk:** 🟠 HIGH - Vulnerable dependencies  
**Effort:** 30 minutes  
**Assignee:** Rufus

**Create `.github/dependabot.yml`:**
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 5
    
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 5

# Also add GitHub Advanced Security
security-updates:
  - enabled: true
```

**Also:**
- Enable GitHub secret scanning
- Enable GitHub code scanning (CodeQL)
- Add `npm audit` to CI/CD

---

#### 14. Add Pre-Commit Security Hooks
**Risk:** 🟠 HIGH - Accidentally commit secrets  
**Effort:** 1 hour  
**Assignee:** Rufus

**Install tools:**
```bash
npm install --save-dev \
  husky \
  lint-staged \
  @commitlint/cli \
  detect-secrets
```

**`.husky/pre-commit`:**
```bash
#!/bin/sh
# Prevent committing secrets
npx detect-secrets-hook --baseline .secrets.baseline

# Lint and format
npx lint-staged

# Run security audit
cd backend && npm audit --audit-level=moderate
cd ../frontend && npm audit --audit-level=moderate
```

---

### Network Security

#### 15. Configure Firewall Rules
**Risk:** 🟠 HIGH - Unnecessary ports exposed  
**Effort:** 30 minutes  
**Assignee:** James

**macOS Firewall:**
```bash
# Enable firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on

# Block all incoming
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setblockall on

# Allow specific apps
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /Applications/Visual\ Studio\ Code.app

# Enable stealth mode
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on
```

---

#### 16. Review and Harden SSH Configuration
**Risk:** 🟠 HIGH - SSH compromise = server access  
**Effort:** 30 minutes  
**Assignee:** James

**Edit `~/.ssh/config`:**
```
# Global defaults
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentitiesOnly yes
  
  # Use modern crypto
  KexAlgorithms curve25519-sha256@libssh.org
  Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
  MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
  
  # Prevent connection reuse attacks
  ControlMaster auto
  ControlPath /tmp/ssh-%r@%h:%p
  ControlPersist 600
  
  # Timeout
  ServerAliveInterval 60
  ServerAliveCountMax 3
```

**Check SSH keys:**
```bash
# List all keys
ls -la ~/.ssh/

# Remove old keys
rm ~/.ssh/id_rsa*  # If using old RSA keys

# Generate new ed25519 key
ssh-keygen -t ed25519 -C "james@chatb2b.com"
```

---

## 🟡 P2 - Medium Risk (This Month)

### Monitoring & Alerting

#### 17. Set Up Security Information and Event Management (SIEM)
**Risk:** 🟡 MEDIUM - Can't detect breaches in real-time  
**Effort:** 4 hours  
**Assignee:** Rufus

**Options:**
- **Simple:** Logtail ($19/mo) + custom alerts
- **Advanced:** Datadog ($0-15/mo free tier)
- **Self-hosted:** Graylog (free, complex)

**Alert on:**
- Failed login attempts (>5 in 5 minutes)
- New login from new location
- API key used from new IP
- Database accessed outside business hours
- Unusual data access patterns
- High error rates
- Spike in traffic

**Telegram notifications:**
```typescript
async function sendSecurityAlert(message: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: JAMES_CHAT_ID,
      text: `🚨 Security Alert: ${message}`,
      parse_mode: 'Markdown',
    }),
  });
}
```

---

#### 18. Implement Database Activity Monitoring
**Risk:** 🟡 MEDIUM - SQL injection, data exfiltration  
**Effort:** 2 hours  
**Assignee:** Rufus

**Supabase has built-in tools:**
- Enable query logging
- Set up alerts for:
  - Large data exports
  - DROP/TRUNCATE commands
  - Schema changes
  - Unusual query patterns

**Query log analysis:**
```sql
-- Find expensive queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Find suspicious queries
SELECT * FROM pg_stat_statements
WHERE query LIKE '%DELETE%'
   OR query LIKE '%TRUNCATE%'
   OR query LIKE '%DROP%';
```

---

#### 19. Add Honeypot Endpoints
**Risk:** 🟡 MEDIUM - Can't detect scanners/bots  
**Effort:** 1 hour  
**Assignee:** Rufus

**Create fake endpoints to detect attacks:**
```typescript
// Fake admin endpoints
app.get('/admin', (req, res) => {
  logger.warn('Honeypot triggered: /admin', {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  res.status(404).send('Not Found');
});

app.post('/api/login', (req, res) => {
  logger.warn('Honeypot triggered: /api/login', {
    ip: req.ip,
    body: req.body,
  });
  res.status(404).send('Not Found');
});

// Auto-block IPs that hit honeypots
```

---

### Access Control

#### 20. Implement Principle of Least Privilege
**Risk:** 🟡 MEDIUM - Over-privileged accounts  
**Effort:** 2 hours  
**Assignee:** Rufus

**Review and restrict:**
- Supabase service role key (only use when necessary)
- Railway deploy permissions
- GitHub repo permissions
- Vercel team permissions
- API key scopes

**Create roles:**
```typescript
enum Role {
  ADMIN = 'admin',      // Full access
  USER = 'user',        // Own data only
  AGENT = 'agent',      // Read + write tasks
  READONLY = 'readonly' // Read only
}

// Middleware
const requireRole = (allowedRoles: Role[]) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

app.delete('/api/tasks/:id', requireRole([Role.ADMIN]), deleteTask);
```

---

#### 21. Add Session Management & Timeout
**Risk:** 🟡 MEDIUM - Abandoned sessions = unauthorized access  
**Effort:** 2 hours  
**Assignee:** Rufus

**Implement:**
- Session timeout (1 hour of inactivity)
- Maximum session duration (24 hours)
- Concurrent session limits (max 3 devices)
- Session revocation endpoint

```typescript
// Supabase config
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
  options: {
    // JWT expires in 1 hour
    expiresIn: 3600,
  }
});

// Refresh token mechanism
setInterval(async () => {
  const { data } = await supabase.auth.refreshSession();
}, 50 * 60 * 1000); // Refresh every 50 minutes
```

---

### Data Security

#### 22. Implement Data Classification & Encryption
**Risk:** 🟡 MEDIUM - Sensitive data exposed  
**Effort:** 3 hours  
**Assignee:** Rufus

**Classify data:**
- **Public:** Task titles (maybe)
- **Internal:** Task descriptions
- **Confidential:** LLM usage, costs
- **Secret:** API keys, passwords

**Encrypt sensitive fields:**
```typescript
import crypto from 'crypto';

class Encryption {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      authTag: authTag.toString('hex'),
    });
  }
  
  decrypt(data: string): string {
    const { iv, encrypted, authTag } = JSON.parse(data);
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final()
    ]).toString('utf8');
  }
}

// Use for sensitive fields
task.api_key = encryption.encrypt(task.api_key);
```

---

#### 23. Add Data Retention & Deletion Policies
**Risk:** 🟡 MEDIUM - Data kept longer than needed  
**Effort:** 2 hours  
**Assignee:** Rufus

**Policies:**
- Completed tasks: Keep 90 days, then archive
- Deleted tasks: Keep 30 days in trash, then permanent delete
- Logs: Keep 90 days
- Audit logs: Keep 1 year
- API keys: Revoke after 90 days of inactivity

**Implementation:**
```sql
-- Scheduled job
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete old completed tasks
  DELETE FROM tasks
  WHERE status = 'complete'
    AND completed_at < NOW() - INTERVAL '90 days';
  
  -- Delete old logs
  DELETE FROM api_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Run daily
SELECT cron.schedule('cleanup', '0 2 * * *', 'SELECT cleanup_old_data()');
```

---

## 🟢 P3 - Low Risk (Nice to Have)

### Advanced Security

#### 24. Implement Content Security Policy (CSP) Headers
**Risk:** 🟢 LOW - XSS attacks  
**Effort:** 1 hour  
**Assignee:** Rufus

**Already partially done, but tighten:**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Remove if possible
      imgSrc: ["'self'", "data:", "https://avatars.githubusercontent.com"],
      connectSrc: ["'self'", "https://ljjqlehrxxxgdcsfvzei.supabase.co"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
```

---

#### 25. Add Subresource Integrity (SRI)
**Risk:** 🟢 LOW - CDN compromise  
**Effort:** 30 minutes  
**Assignee:** Rufus

**If using any CDN resources:**
```html
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-hash"
  crossorigin="anonymous"
></script>
```

---

#### 26. Implement Certificate Pinning
**Risk:** 🟢 LOW - MITM attacks on API calls  
**Effort:** 2 hours  
**Assignee:** Rufus

**Pin Supabase certificate:**
```typescript
import https from 'https';
import crypto from 'crypto';

const SUPABASE_CERT_SHA256 = 'expected_sha256_hash';

const agent = new https.Agent({
  checkServerIdentity: (host, cert) => {
    const certHash = crypto
      .createHash('sha256')
      .update(cert.raw)
      .digest('hex');
    
    if (certHash !== SUPABASE_CERT_SHA256) {
      throw new Error('Certificate mismatch');
    }
  },
});

// Use with fetch
fetch('https://supabase.co', { agent });
```

---

#### 27. Add Security.txt & Vulnerability Disclosure Policy
**Risk:** 🟢 LOW - Researchers can't report vulnerabilities  
**Effort:** 15 minutes  
**Assignee:** Rufus

**Create `frontend/public/.well-known/security.txt`:**
```
Contact: mailto:security@chatb2b.com
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: en
Canonical: https://clawban.vercel.app/.well-known/security.txt
Policy: https://clawban.vercel.app/security-policy

# PGP Key (optional)
Encryption: https://clawban.vercel.app/pgp-key.txt

# Acknowledgments
Acknowledgments: https://clawban.vercel.app/hall-of-fame
```

---

#### 28. Set Up Bug Bounty Program
**Risk:** 🟢 LOW - Miss vulnerabilities  
**Effort:** 2 hours  
**Assignee:** James

**Options:**
- **Simple:** Email disclosure (free)
- **Platform:** HackerOne, Bugcrowd ($500+ rewards)
- **Self-managed:** GitHub Security Advisories

**Define scope:**
```markdown
## In Scope
- clawban.vercel.app
- API endpoints
- Authentication/authorization
- Data access controls

## Out of Scope
- Social engineering
- Physical security
- Third-party services (Supabase, Railway, Vercel)

## Rewards
- Critical: $500
- High: $200
- Medium: $50
- Low: $25
```

---

## 📊 Security Metrics Dashboard

**Track monthly:**
```markdown
### Access Control
- [ ] All accounts have 2FA: __/10 (100%)
- [ ] Password manager adoption: Yes/No
- [ ] Failed login attempts: __ (goal: <10/month)

### API Security
- [ ] Authentication enabled: Yes/No
- [ ] RLS policies active: Yes/No
- [ ] Rate limiting active: Yes/No
- [ ] API keys rotated: Days since last (__/90)

### Infrastructure
- [ ] FileVault enabled: Yes/No
- [ ] Firewall enabled: Yes/No
- [ ] VPN active: Yes/No
- [ ] Backups verified: Date of last test

### Code Security
- [ ] npm audit vulnerabilities: __ (goal: 0)
- [ ] Dependabot PRs open: __ (goal: <5)
- [ ] Security scanning enabled: Yes/No

### Monitoring
- [ ] Security alerts configured: Yes/No
- [ ] Log retention active: Yes/No
- [ ] Audit logs reviewed: Date of last review

### Compliance
- [ ] Data retention policies: Yes/No
- [ ] Incident response plan: Yes/No
- [ ] Security training: Last completed
```

---

## 🚨 Incident Response Playbook

### If API Key is Leaked

1. **Immediate (< 5 minutes):**
   - Generate new API key: `openssl rand -hex 32`
   - Update Railway `AGENT_API_KEY`
   - Restart all services

2. **Investigation (< 1 hour):**
   - Check API logs for unauthorized usage
   - Identify what data was accessed
   - Document timeline of exposure

3. **Remediation:**
   - Notify affected users (if any)
   - Review how leak occurred
   - Implement prevention measures

---

### If Database is Compromised

1. **Immediate (< 5 minutes):**
   - Change database password
   - Enable IP allowlist (if not already)
   - Review active connections

2. **Investigation (< 1 hour):**
   - Check Supabase audit logs
   - Identify unauthorized queries
   - Assess data breach scope

3. **Remediation:**
   - Notify users (if personal data exposed)
   - Report to authorities if required (GDPR)
   - Implement additional controls

---

### If Laptop is Stolen

1. **Immediate (< 5 minutes):**
   - Use Find My Mac to locate/lock/erase
   - Change all passwords from another device
   - Revoke all active sessions

2. **Investigation (< 1 hour):**
   - Review recent activity on accounts
   - Check for unauthorized access
   - Assess what data was on laptop

3. **Remediation:**
   - File police report (for insurance)
   - Rotate all SSH keys
   - Enable FileVault on new device

---

## 📅 Security Maintenance Schedule

**Daily:**
- Review security alerts
- Monitor API usage

**Weekly:**
- Review failed login attempts
- Check for new Dependabot PRs
- Run `npm audit`

**Monthly:**
- Review access logs
- Update dependencies
- Test backup restoration
- Review user permissions

**Quarterly:**
- Rotate API keys
- Security training/review
- Penetration testing
- Policy review

**Annually:**
- Comprehensive security audit
- Third-party penetration test
- Disaster recovery drill
- Update incident response plan

---

## 💰 Security Budget

**One-time:**
- YubiKey (hardware key): $50
- External backup drive: $100
- **Total: $150**

**Monthly:**
- Password manager: $3-5
- VPN: $5-10 (James already has)
- Cloud backup (Backblaze): $7
- Monitoring (Logtail): $19 (optional)
- **Total: $15-41/month**

---

## 🎯 Success Criteria

**Minimum viable security:**
- ✅ Authentication on all APIs
- ✅ 2FA on all accounts
- ✅ Encrypted backups
- ✅ No secrets in Git
- ✅ Dependency scanning

**Production-ready security:**
- All P0 and P1 items complete
- Security monitoring active
- Incident response plan tested
- Regular security audits

**Enterprise-grade security:**
- All items complete
- SOC 2 compliance
- Penetration testing
- Bug bounty program

---

## 📚 Learning Resources

**Books:**
- "Web Application Security" by Andrew Hoffman
- "The Tangled Web" by Michal Zalewski

**Courses:**
- OWASP Top 10 (free)
- PortSwigger Web Security Academy (free)

**Tools:**
- OWASP ZAP (penetration testing)
- Burp Suite (security testing)
- Nmap (network scanning)

**Communities:**
- r/netsec
- HackerOne Discord
- OWASP Slack

---

**Next Action:** Start with P0 tasks. Get authentication working, enable 2FA, rotate credentials. Rest can follow.
