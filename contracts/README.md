# Contracts

Shared TypeScript types between frontend and backend.

## Usage

### Backend
```typescript
import { Task, CreateTaskRequest } from '../contracts/types';
```

### Frontend
```typescript
import { Task, TaskStatus } from '../contracts/types';
```

## Types

- `Task` - Main task entity
- `TaskStatus` - Status enum (new, approved, in-progress, complete)
- `ModelStrategy` - Model strategy enum
- `LLMUsage` - LLM usage tracking
- `CreateTaskRequest` - Create task request body
- `UpdateTaskRequest` - Update task request body
- `MoveTaskRequest` - Move task request body
- `ApiResponse<T>` - Generic API response wrapper
- `ListTasksResponse` - List tasks response

## Type Safety

All types are shared to ensure 100% type safety between frontend and backend. Any changes to the API contract must be reflected in these types.
