/**
 * Task service - Business logic for task management
 */

import { nanoid } from 'nanoid';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from '../../../contracts/types.js';
import { readData, writeData } from './storage.service.js';

interface TasksData {
  tasks: Task[];
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  const data = await readData<TasksData>();
  return data.tasks;
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const data = await readData<TasksData>();
  return data.tasks.find((task) => task.id === id) || null;
}

/**
 * Create a new task
 */
export async function createTask(request: CreateTaskRequest): Promise<Task> {
  const data = await readData<TasksData>();

  const newTask: Task = {
    id: nanoid(),
    title: request.title,
    description: request.description,
    model_strategy: request.model_strategy,
    estimated_token_cost: request.estimated_token_cost || 0,
    estimated_dollar_cost: request.estimated_dollar_cost || 0,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    llm_usage: [],
  };

  data.tasks.push(newTask);
  await writeData(data);

  return newTask;
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, request: UpdateTaskRequest): Promise<Task | null> {
  const data = await readData<TasksData>();
  const taskIndex = data.tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return null;
  }

  const updatedTask: Task = {
    ...data.tasks[taskIndex],
    ...request,
    updated_at: new Date().toISOString(),
    // Set completed_at if status changed to complete
    completed_at:
      request.status === 'complete' && data.tasks[taskIndex].status !== 'complete'
        ? new Date().toISOString()
        : data.tasks[taskIndex].completed_at,
  };

  data.tasks[taskIndex] = updatedTask;
  await writeData(data);

  return updatedTask;
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  const data = await readData<TasksData>();
  const initialLength = data.tasks.length;

  data.tasks = data.tasks.filter((task) => task.id !== id);

  if (data.tasks.length === initialLength) {
    return false;
  }

  await writeData(data);
  return true;
}

/**
 * Move task to a different status
 */
export async function moveTask(id: string, status: TaskStatus): Promise<Task | null> {
  return updateTask(id, { status });
}
