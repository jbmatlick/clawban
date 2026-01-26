# Clawban Backend

REST API for Clawban task management platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test
```

## 📖 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### List All Tasks
```http
GET /api/tasks
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "abc123",
        "title": "Build authentication system",
        "description": "Implement JWT-based auth...",
        "model_strategy": "opus-coding",
        "estimated_token_cost": 50000,
        "estimated_dollar_cost": 1.5,
        "status": "new",
        "created_at": "2026-01-26T12:00:00Z",
        "updated_at": "2026-01-26T12:00:00Z",
        "completed_at": null,
        "llm_usage": []
      }
    ],
    "total": 1
  }
}
```

#### Get Single Task
```http
GET /api/tasks/:id
```

**Response:**
```json
{
  "success": true,
  "data": { /* task object */ }
}
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Build authentication system",
  "description": "Implement JWT-based auth with refresh tokens",
  "model_strategy": "opus-coding",
  "estimated_token_cost": 50000,
  "estimated_dollar_cost": 1.5
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created task */ }
}
```

#### Update Task
```http
PATCH /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in-progress"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated task */ }
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "abc123" }
}
```

#### Move Task
```http
POST /api/tasks/:id/move
Content-Type: application/json

{
  "status": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated task */ }
}
```

## 🏗️ Architecture

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # Express routes
│   ├── services/        # Business logic
│   ├── middleware/      # Validators, etc.
│   └── index.ts         # App entry point
├── data/                # JSON storage (gitignored)
├── package.json
└── tsconfig.json
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

## 🔒 Type Safety

All API contracts are defined in `../contracts/types.ts` and shared with the frontend for 100% type safety.

## 📝 Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with TypeScript rules
- **Prettier**: Consistent formatting
- **Jest**: Unit tests with >80% coverage

## 🗄️ Data Storage

Tasks are stored in `data/tasks.json` for easy development and testing. This can be easily migrated to a database (PostgreSQL, MongoDB, etc.) by replacing the `storage.service.ts` module.

## 🔧 Environment Variables

```bash
PORT=3001  # Default: 3001
```

## 📦 Dependencies

- **express**: Web framework
- **cors**: CORS middleware
- **express-validator**: Request validation
- **nanoid**: ID generation
- **typescript**: Type safety
