# Clawban Security Audit

*Conducted by: Claude Opus 4.5*  
*Date: January 26, 2025*

---

## Executive Summary

**Overall Risk Level: 🟡 HIGH**

Clawban is a well-structured TypeScript application with good foundational security practices. However, it has **no authentication or authorization**, making it unsuitable for any multi-user or public deployment without significant security hardening.

The codebase demonstrates security awareness (input validation, file locking, type safety), but lacks several critical production-ready security controls.

| Category | Finding Count |
|----------|---------------|
| 🔴 Critical | 1 |
| 🟡 High | 4 |
| 🟠 Medium | 5 |
| ⚪ Low | 4 |
| ✅ Secure Practices | 10 |

---

## Critical Vulnerabilities 🔴

### 1. Complete Lack of Authentication/Authorization

**File:** `backend/src/index.ts` (entire API)  
**Severity:** CRITICAL  
**CVSS:** 9.8 (Critical)

**Attack Vector:**
Any network client can perform all operations: create, read, update, and delete tasks. No identity verification, no session management, no access control.

**Impact:**
- Complete data breach (read all tasks)
- Data destruction (delete all tasks)
- Data manipulation (modify any task)
- Service abuse (unlimited resource creation)

**Proof of Concept:**
```bash
# Anyone can read all tasks
curl http://localhost:3001/api/tasks

# Anyone can delete any task
curl -X DELETE http://localhost:3001/api/tasks/y9wy2jj7uWT-pEMkTdRrK

# Anyone can create unlimited tasks
for i in {1..1000}; do
  curl -X POST http://localhost:3001/api/tasks \
    -H "Content-Type: application/json" \
    -d '{"title":"spam","description":"x","model_strategy":"mixed"}'
done
```

**Fix:**
```typescript
// backend/src/index.ts - Add authentication middleware
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

app.use('/api/tasks', authMiddleware, taskRoutes);
```

---

## High Risk 🟡

### 2. No Rate Limiting

**File:** `backend/src/index.ts`  
**Severity:** HIGH  
**CVSS:** 7.5

**Attack Vector:**
No protection against brute force attacks, resource exhaustion, or denial of service. An attacker can flood the API with requests.

**Impact:**
- Denial of Service (DoS)
- Resource exhaustion
- File system abuse (unlimited task creation)
- Cost amplification for downstream services

**Proof of Concept:**
```bash
# Flood the API with 10,000 requests
ab -n 10000 -c 100 http://localhost:3001/api/tasks
```

**Fix:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests' },
});

app.use(limiter);

// Stricter limit for write operations
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});
router.post('/', writeLimiter, createTaskValidators, taskController.createTask);
```

---

### 3. Missing Security Headers

**File:** `backend/src/index.ts`  
**Severity:** HIGH  
**CVSS:** 6.5

**Attack Vector:**
No `helmet.js` or manual security headers. Missing Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.

**Impact:**
- Clickjacking attacks
- MIME-type sniffing attacks
- Cross-site scripting (if content is served)
- Information disclosure

**Fix:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
```

---

### 4. No CSRF Protection

**File:** `backend/src/index.ts`  
**Severity:** HIGH  
**CVSS:** 6.1

**Attack Vector:**
The API accepts POST/PATCH/DELETE requests without CSRF tokens. Combined with CORS allowing credentials, an attacker's site could make authenticated requests on behalf of a user.

**Impact:**
- Unauthorized task creation/deletion
- Cross-site request forgery attacks

**Fix:**
```typescript
import csrf from 'csurf';

// For session-based auth
app.use(csrf({ cookie: true }));

// Or for token-based APIs, ensure SameSite cookies
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  // Add SameSite strict for CSRF protection
}));
```

---

### 5. Unbounded Request Body Size

**File:** `backend/src/index.ts:18`  
**Severity:** HIGH  
**CVSS:** 5.9

**Attack Vector:**
```typescript
app.use(express.json()); // No size limit!
```

An attacker can send extremely large JSON payloads to exhaust server memory.

**Proof of Concept:**
```bash
# Send 100MB JSON payload
python -c "print('{\"title\":\"' + 'A'*100000000 + '\"}')" | \
  curl -X POST http://localhost:3001/api/tasks \
    -H "Content-Type: application/json" \
    -d @-
```

**Impact:**
- Memory exhaustion
- Server crash
- Denial of service

**Fix:**
```typescript
// backend/src/index.ts:18
app.use(express.json({ limit: '100kb' }));
```

---

## Medium Risk 🟠

### 6. Potential Prototype Pollution via Object Spread

**File:** `backend/src/services/task.service.ts:52-58`  
**Severity:** MEDIUM  
**CVSS:** 5.3

**Attack Vector:**
```typescript
const updatedTask: Task = {
  ...data.tasks[taskIndex],
  ...request,  // User-controlled input spread directly
  updated_at: new Date().toISOString(),
};
```

While `express-validator` validates known fields, it doesn't strip unknown fields. An attacker could send `__proto__` or `constructor` to attempt prototype pollution.

**Proof of Concept:**
```bash
curl -X PATCH http://localhost:3001/api/tasks/abc123 \
  -H "Content-Type: application/json" \
  -d '{"__proto__": {"isAdmin": true}}'
```

**Impact:**
- Potential prototype pollution
- Property injection
- Application logic bypass

**Fix:**
```typescript
// backend/src/middleware/validators.ts - Add sanitizer
import { body, matchedData } from 'express-validator';

// In controller, use only validated data:
const taskRequest = matchedData(req) as UpdateTaskRequest;

// Or explicitly whitelist fields:
const allowedFields = ['title', 'description', 'model_strategy', 'status', 
                       'estimated_token_cost', 'estimated_dollar_cost'];
const sanitized = Object.fromEntries(
  Object.entries(request).filter(([key]) => allowedFields.includes(key))
);
```

---

### 7. Read Operations Outside File Lock

**File:** `backend/src/services/task.service.ts:17-20, 22-26`  
**Severity:** MEDIUM  
**CVSS:** 4.0

**Attack Vector:**
```typescript
export async function getAllTasks(): Promise<Task[]> {
  const data = await readData<TasksData>();  // No lock!
  return data.tasks;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const data = await readData<TasksData>();  // No lock!
  return data.tasks.find((task) => task.id === id) || null;
}
```

While write operations use `withLock()`, read operations don't. This can lead to reading partially-written data during concurrent write operations.

**Impact:**
- Dirty reads
- Inconsistent data
- Potential JSON parse errors if read during write

**Fix:**
```typescript
export async function getAllTasks(): Promise<Task[]> {
  return withLock(async () => {
    const data = await readData<TasksData>();
    return data.tasks;
  });
}
```

---

### 8. Error Information Disclosure in Logs

**File:** `backend/src/index.ts:40-44`  
**Severity:** MEDIUM  
**CVSS:** 3.7

**Attack Vector:**
```typescript
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);  // Full stack trace to logs
  // ...
});
```

Full error objects including stack traces are logged. In production environments with log aggregation, this could expose sensitive information.

**Impact:**
- Information disclosure
- Internal path exposure
- Dependency version leakage

**Fix:**
```typescript
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', err.message, { requestId: req.id });
  } else {
    console.error('Unhandled error:', err);
  }
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});
```

---

### 9. No JSON Parse Error Handling in Storage

**File:** `backend/src/services/storage.service.ts:35-38`  
**Severity:** MEDIUM  
**CVSS:** 3.5

**Attack Vector:**
```typescript
export async function readData<T>(): Promise<T> {
  await ensureDataFile();
  const data = await fs.readFile(TASKS_FILE, 'utf-8');
  return JSON.parse(data) as T;  // No try-catch!
}
```

If `tasks.json` is corrupted (disk error, concurrent write failure, manual edit), the entire application crashes.

**Impact:**
- Application crash
- Denial of service
- Data loss if error causes restart loop

**Fix:**
```typescript
export async function readData<T>(): Promise<T> {
  await ensureDataFile();
  const data = await fs.readFile(TASKS_FILE, 'utf-8');
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('JSON parse error, initializing empty data');
    const emptyData = { tasks: [] };
    await writeData(emptyData);
    return emptyData as T;
  }
}
```

---

### 10. Weak ID Validation Regex

**File:** `backend/src/middleware/validators.ts:36-40`  
**Severity:** MEDIUM  
**CVSS:** 3.1

**Attack Vector:**
```typescript
export const idParamValidator = [
  param('id')
    .isString()
    .isLength({ min: 1, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid task ID format'),
];
```

The regex allows `_` and `-` which, while matching `nanoid` output, could potentially be used in edge cases. Additionally, the 30-character limit differs from `nanoid`'s default 21-character output.

**Fix:**
```typescript
// More precise nanoid validation
export const idParamValidator = [
  param('id')
    .isString()
    .isLength({ min: 21, max: 21 })
    .matches(/^[A-Za-z0-9_-]{21}$/)
    .withMessage('Invalid task ID format'),
];
```

---

## Low Risk ⚪

### 11. CORS Origin Parsing Vulnerability

**File:** `backend/src/index.ts:14-18`  
**Severity:** LOW  
**CVSS:** 2.5

**Attack Vector:**
```typescript
origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
```

If `ALLOWED_ORIGINS` is set to an empty string, it becomes `['']` which could behave unexpectedly in some CORS implementations.

**Fix:**
```typescript
const parseOrigins = (envVar?: string): string[] => {
  if (!envVar || envVar.trim() === '') {
    return ['http://localhost:5173'];
  }
  return envVar.split(',').map(o => o.trim()).filter(Boolean);
};

app.use(cors({
  origin: parseOrigins(process.env.ALLOWED_ORIGINS),
  // ...
}));
```

---

### 12. No HTTPS Enforcement

**File:** `backend/src/index.ts`  
**Severity:** LOW  
**CVSS:** 2.4

**Attack Vector:**
No forced redirect to HTTPS in production. If deployed behind a reverse proxy without proper configuration, traffic could be unencrypted.

**Fix:**
```typescript
// Trust proxy for X-Forwarded-Proto header
app.set('trust proxy', 1);

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
```

---

### 13. Deprecated Dependency: react-beautiful-dnd

**File:** `frontend/package.json:11`  
**Severity:** LOW  
**CVSS:** 2.0

**Attack Vector:**
`react-beautiful-dnd` is unmaintained (last update 2022). While no CVEs exist currently, unmaintained packages are security risks.

**Fix:**
Migrate to `@dnd-kit/core` or `@hello-pangea/dnd` (the community fork).

```json
{
  "dependencies": {
    "@hello-pangea/dnd": "^16.0.0"
  }
}
```

---

### 14. Verbose Request Logging

**File:** `backend/src/index.ts:21-24`  
**Severity:** LOW  
**CVSS:** 1.5

**Attack Vector:**
```typescript
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

Request paths are logged to stdout. In production, this could expose sensitive query parameters or paths.

**Fix:**
```typescript
// Use a proper logging library with log levels
import morgan from 'morgan';

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
```

---

## Secure Practices ✅

### What's Done Well

1. **Input Validation** - All endpoints use `express-validator` with proper constraints:
   - Title: 1-200 characters, trimmed
   - Description: 1-10,000 characters, trimmed
   - Status/Strategy: Enum validation with whitelist
   - ID: Regex pattern matching

2. **Type Safety** - Full TypeScript with strict types across frontend and backend. Shared contracts prevent type mismatches.

3. **File Locking for Writes** - Using `proper-lockfile` prevents race conditions on write operations.

4. **No SQL/NoSQL Injection** - JSON file storage eliminates injection attacks entirely.

5. **No Dangerous Functions** - No `eval()`, no `Function()` constructor, no `child_process.exec()` with user input.

6. **No dangerouslySetInnerHTML** - React frontend doesn't bypass XSS protection.

7. **Secrets Not Hardcoded** - No API keys, passwords, or secrets in the codebase. `.gitignore` excludes `.env` files.

8. **Clean Dependencies** - `npm audit` reports 0 vulnerabilities in both frontend and backend.

9. **Proper Error Responses** - Generic error messages to clients (no stack traces leaked).

10. **CORS Configured** - Origin allowlist (though could be tightened for production).

---

## Remediation Priority

### Immediate (Before Any Deployment)

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Add Authentication | 2-4 hours | Critical |
| P0 | Add Rate Limiting | 30 min | High |
| P0 | Add Request Size Limits | 5 min | High |

### Before Production

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P1 | Add Security Headers (helmet.js) | 15 min | High |
| P1 | Fix Prototype Pollution | 30 min | Medium |
| P1 | Add Read Operation Locks | 15 min | Medium |

### Best Practices

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P2 | Add CSRF Protection | 1 hour | High |
| P2 | Add JSON Parse Error Handling | 15 min | Medium |
| P2 | Improve Logging | 30 min | Low |
| P3 | Migrate from react-beautiful-dnd | 2-4 hours | Low |
| P3 | Add HTTPS Enforcement | 15 min | Low |

---

## Quick Wins

Copy-paste fixes for highest-impact, lowest-effort improvements:

### 1. Add Rate Limiting & Body Limit (5 min)

```bash
cd backend && npm install express-rate-limit helmet
```

```typescript
// backend/src/index.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '100kb' }));
```

### 2. Sanitize Update Input (5 min)

```typescript
// backend/src/services/task.service.ts - Replace line 51-58
const allowedFields = ['title', 'description', 'model_strategy', 
                       'status', 'estimated_token_cost', 'estimated_dollar_cost'] as const;
const sanitizedRequest = Object.fromEntries(
  Object.entries(request).filter(([key]) => 
    (allowedFields as readonly string[]).includes(key)
  )
);

const updatedTask: Task = {
  ...data.tasks[taskIndex],
  ...sanitizedRequest,
  updated_at: new Date().toISOString(),
  completed_at:
    request.status === 'complete' && data.tasks[taskIndex].status !== 'complete'
      ? new Date().toISOString()
      : data.tasks[taskIndex].completed_at,
};
```

---

## Conclusion

Clawban is a well-architected proof-of-concept with solid foundations. The code quality is high and demonstrates security awareness. However, **it is not production-ready** without authentication and rate limiting at minimum.

For a single-user local deployment, the current state is acceptable. For any shared or public deployment, implement the P0 and P1 fixes before going live.

**Recommended next step:** Implement JWT-based authentication with proper user management, then add rate limiting and security headers.

---

*This audit was conducted via static code analysis. Dynamic testing (penetration testing) may reveal additional vulnerabilities.*
