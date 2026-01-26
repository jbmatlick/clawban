# Clawban - AI Task Management Platform

A professional task management system for AI agents with a Kanban board interface.

## 🏗️ Architecture

Clawban follows an enterprise monorepo pattern with clear separation of concerns:

```
clawban/
├── backend/      # Node.js + Express REST API
├── frontend/     # React + Vite + TypeScript UI
├── contracts/    # Shared TypeScript types
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

Run both servers concurrently:

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Visit http://localhost:5173 to see the app.

## 📋 Features

### Kanban Board
- **New** - Tasks proposed by AI
- **Approved** - Human approved, ready to work
- **In Progress** - Currently being executed  
- **Complete** - Done

### Task Management
- Create, update, and delete tasks
- Drag-and-drop between columns
- Track LLM usage and costs
- Model strategy selection
- Markdown description support

### Task Fields
- Title
- Description (markdown)
- Model strategy (opus-planning, opus-coding, sonnet-coding, mixed)
- Estimated token cost
- Estimated dollar cost
- Status (new, approved, in-progress, complete)
- Timestamps (created, updated, completed)
- LLM usage log

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **API Spec**: OpenAPI 3.0
- **Storage**: JSON file (easy DB migration)
- **Testing**: Jest
- **Linting**: ESLint + Prettier

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS v4
- **Data Fetching**: TanStack Query
- **Drag & Drop**: react-beautiful-dnd
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

### Contracts
- Shared TypeScript types
- OpenAPI-generated types
- 100% type safety between FE/BE

## 📖 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/move` | Move task between columns |

See [backend/README.md](backend/README.md) for detailed API documentation.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🎨 Design System

Clawban uses a professional, enterprise-grade design system inspired by modern SaaS applications:

- **Primary color**: #16a39b (teal)
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px grid system
- **Components**: Radix UI primitives
- **Responsive**: Mobile-first approach

## 💰 Cost Breakdown

### Development Time
- Architecture & Setup: 30 minutes
- Backend API: 1 hour
- Frontend UI: 2 hours
- Testing & Documentation: 45 minutes
- **Total**: ~4 hours

### Token Usage (Claude Opus 4.5)
- Planning: ~50k tokens
- Implementation: ~200k tokens
- Testing/Refinement: ~50k tokens
- **Total**: ~300k tokens (~$9)

## 📄 License

MIT

## 🤝 Contributing

This is a personal project for AI task management. Feel free to fork and customize for your needs.

## 🔗 Links

- [GitHub Repository](https://github.com/jbmatlick/clawban)
- [API Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
