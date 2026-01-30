/**
 * React Query hooks for API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  TaskAssignee,
  BoardType,
} from '../../../contracts/types';
import * as api from './client';

const QUERY_KEYS = {
  tasks: (assignee?: TaskAssignee, tag?: string, board?: BoardType) => ['tasks', assignee, tag, board] as const,
  task: (id: string) => ['tasks', id] as const,
};

/**
 * Hook to fetch all tasks with optional filters
 */
export function useTasks(assignee?: TaskAssignee, tag?: string, board?: BoardType) {
  return useQuery({
    queryKey: QUERY_KEYS.tasks(assignee, tag, board),
    queryFn: () => api.listTasks(assignee, tag, board),
  });
}

/**
 * Hook to fetch single task
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.task(id),
    queryFn: () => api.getTask(id),
    enabled: !!id,
  });
}

/**
 * Hook to create task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTaskRequest) => api.createTask(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
}

/**
 * Hook to update task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateTaskRequest }) =>
      api.updateTask(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
}

/**
 * Hook to delete task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
}

/**
 * Hook to move task
 */
export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: MoveTaskRequest }) =>
      api.moveTask(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
  });
}
