/**
 * Task service - Business logic for task management
 * Uses Supabase for persistence
 */

import { nanoid } from 'nanoid';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from '../../../contracts/types.js';
import * as storage from './supabase-storage.service.js';
import { ensureTagsExist } from './tag.service.js';

interface TasksData {
  tasks: Task[];
}

/**
 * Get all tasks with optional filtering
 */
export async function getAllTasks(assignee?: string | null, tag?: string): Promise<Task[]> {
  const data = await storage.readData<TasksData>();
  
  let tasks = data.tasks.map(task => ({
    ...task,
    tags: task.tags || [],
  }));
  
  // Filter by assignee if specified
  if (assignee !== undefined) {
    tasks = tasks.filter(task => task.assignee === assignee);
  }
  
  // Filter by tag if specified
  if (tag) {
    tasks = tasks.filter(task => task.tags?.includes(tag));
  }
  
  return tasks;
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  return storage.getTaskById(id);
}

/**
 * Create a new task
 */
export async function createTask(request: CreateTaskRequest): Promise<Task> {
  // Ensure tags exist and get normalized names
  const tags = request.tags ? await ensureTagsExist(request.tags) : [];

  const newTask: Task = {
    id: nanoid(),
    title: request.title,
    description: request.description,
    model_strategy: request.model_strategy,
    estimated_token_cost: request.estimated_token_cost || 0,
    estimated_dollar_cost: request.estimated_dollar_cost || 0,
    status: 'new',
    assignee: request.assignee || null,
    tags,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    llm_usage: [],
  };

  return storage.insertTask(newTask);
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, request: UpdateTaskRequest): Promise<Task | null> {
  const existingTask = await storage.getTaskById(id);
  
  if (!existingTask) {
    return null;
  }

  // Ensure tags exist and get normalized names if tags are being updated
  const tags = request.tags 
    ? await ensureTagsExist(request.tags) 
    : (existingTask.tags || []);

  const updates: Partial<Task> = {
    ...request,
    tags,
    updated_at: new Date().toISOString(),
  };

  // Set completed_at if status changed to complete
  if (request.status === 'complete' && existingTask.status !== 'complete') {
    updates.completed_at = new Date().toISOString();
  }

  return storage.updateTaskById(id, updates);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  return storage.deleteTaskById(id);
}

/**
 * Move task to a different status
 */
export async function moveTask(id: string, status: TaskStatus): Promise<Task | null> {
  return updateTask(id, { status });
}
