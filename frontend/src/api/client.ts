/**
 * API client for Clawban backend
 */

import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  ApiResponse,
  ListTasksResponse,
} from '../../../contracts/types';

const API_BASE = '/api';

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data as T;
}

/**
 * List all tasks
 */
export async function listTasks(): Promise<ListTasksResponse> {
  const response = await fetch(`${API_BASE}/tasks`);
  return handleResponse<ListTasksResponse>(response);
}

/**
 * Get single task
 */
export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`);
  return handleResponse<Task>(response);
}

/**
 * Create a new task
 */
export async function createTask(request: CreateTaskRequest): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<Task>(response);
}

/**
 * Update a task
 */
export async function updateTask(id: string, request: UpdateTaskRequest): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<Task>(response);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ id: string }>(response);
}

/**
 * Move task to different status
 */
export async function moveTask(id: string, request: MoveTaskRequest): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<Task>(response);
}
