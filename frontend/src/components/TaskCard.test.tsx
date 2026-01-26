/**
 * TaskCard component tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskCard } from './TaskCard';
import type { Task } from '../../../contracts/types';

// Mock react-beautiful-dnd to avoid drag context errors
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => children,
  Droppable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
    children({ droppableProps: {}, innerRef: () => {}, placeholder: null }),
  Draggable: ({ children }: { children: (provided: unknown) => React.ReactNode }) =>
    children({ draggableProps: {}, dragHandleProps: {}, innerRef: () => {} }),
}));

const mockTask: Task = {
  id: 'test-task-1',
  title: 'Test Task Title',
  description: 'This is a test task description',
  model_strategy: 'opus-coding',
  estimated_token_cost: 1500,
  estimated_dollar_cost: 1.5,
  status: 'new',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  completed_at: null,
  llm_usage: [],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} />, { wrapper: createWrapper() });
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard task={mockTask} />, { wrapper: createWrapper() });
    expect(screen.getByText('This is a test task description')).toBeInTheDocument();
  });

  it('renders model strategy badge', () => {
    render(<TaskCard task={mockTask} />, { wrapper: createWrapper() });
    expect(screen.getByText('Opus Coding')).toBeInTheDocument();
  });

  it('formats cost correctly', () => {
    render(<TaskCard task={mockTask} />, { wrapper: createWrapper() });
    expect(screen.getByText('$1.50')).toBeInTheDocument();
  });

  it('formats token count correctly', () => {
    render(<TaskCard task={mockTask} />, { wrapper: createWrapper() });
    expect(screen.getByText('1,500 tokens')).toBeInTheDocument();
  });

  it('shows completed date when task is complete', () => {
    const completedTask: Task = {
      ...mockTask,
      status: 'complete',
      completed_at: '2024-01-15T12:00:00Z',
    };
    render(<TaskCard task={completedTask} />, { wrapper: createWrapper() });
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });

  it('has delete button with accessible label', () => {
    render(<TaskCard task={mockTask} />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: 'Delete task' })).toBeInTheDocument();
  });
});
