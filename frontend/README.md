# Clawban Frontend

Professional React UI for Clawban task management platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── api/             # API client and hooks
│   ├── styles/          # CSS and theme
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html
└── vite.config.ts
```

## 🎨 Design System

Clawban uses a professional design system inspired by modern SaaS applications:

### Colors
- **Primary**: #16a39b (Teal)
- **Secondary**: #f3f4f6 (Light Gray)
- **Destructive**: #d4183d (Red)
- **Muted**: #f5f6f8 (Very Light Gray)

### Typography
- **Font**: System fonts (sans-serif)
- **Headings**: Medium weight (500)
- **Body**: Normal weight (400)

### Components
- Kanban board with drag-and-drop
- Task cards with metadata
- Create task form
- Status columns with color coding

## 🧩 Components

### KanbanBoard
Main board component with drag-and-drop functionality using react-beautiful-dnd.

### KanbanColumn
Individual column for each task status (New, Approved, In Progress, Complete).

### TaskCard
Card component displaying task information with edit/delete actions.

### CreateTaskForm
Form for creating new tasks with validation.

## 🔌 API Integration

Uses TanStack Query (React Query) for:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 📱 Responsive Design

- **Desktop**: 4-column Kanban board
- **Tablet**: 2-column layout
- **Mobile**: Single column with scrolling

## 🎯 Features

### Drag & Drop
- Smooth animations
- Visual feedback
- Touch support (mobile)
- Keyboard navigation

### Real-time Updates
- Automatic refetching
- Optimistic UI updates
- Error boundaries

### Type Safety
- 100% TypeScript
- Shared contracts with backend
- Strict mode enabled

## 🔧 Configuration

### Vite
- Fast HMR (Hot Module Replacement)
- Optimized builds
- Proxy to backend API

### Tailwind CSS v4
- Custom theme matching chatb2b-web
- Responsive utilities
- Dark mode ready (not yet enabled)

## 📦 Dependencies

### Core
- **React 18**: UI framework
- **TanStack Query**: Data fetching
- **react-beautiful-dnd**: Drag and drop

### Styling
- **Tailwind CSS v4**: Utility-first CSS
- **lucide-react**: Icon library
- **clsx + tailwind-merge**: Class utilities

### Dev Tools
- **Vite**: Build tool
- **TypeScript**: Type safety
- **Vitest**: Testing framework
- **ESLint**: Linting
