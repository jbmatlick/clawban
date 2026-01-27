/**
 * API client for Clawban backend with auth
 */

import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  ApiResponse,
  ListTasksResponse,
  TaskAssignee,
} from '../../../contracts/types';
import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get auth token for API requests
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

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
 * List all tasks with optional filters
 */
export async function listTasks(
  assignee?: TaskAssignee,
  tag?: string
): Promise<ListTasksResponse> {
  const headers = await getAuthHeaders();
  
  // Build query string
  const params = new URLSearchParams();
  if (assignee !== undefined) {
    params.append('assignee', assignee === null ? 'null' : assignee);
  }
  if (tag) {
    params.append('tag', tag);
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE}/api/tasks${query}`, { headers });
  return handleResponse<ListTasksResponse>(response);
}

/**
 * Get single task
 */
export async function getTask(id: string): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/tasks/${id}`, { headers });
  return handleResponse<Task>(response);
}

/**
 * Create a new task
 */
export async function createTask(request: CreateTaskRequest): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  return handleResponse<Task>(response);
}

/**
 * Update a task
 */
export async function updateTask(id: string, request: UpdateTaskRequest): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(request),
  });
  return handleResponse<Task>(response);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'DELETE',
    headers,
  });
  await handleResponse<{ id: string }>(response);
}

/**
 * Move task to different status
 */
export async function moveTask(id: string, request: MoveTaskRequest): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/tasks/${id}/move`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  return handleResponse<Task>(response);
}
