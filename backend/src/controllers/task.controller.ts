/**
 * Task controller - HTTP request handlers
 */

import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  ApiResponse,
  ListTasksResponse,
  Task,
} from '../../../contracts/types.js';
import * as taskService from '../services/task.service.js';

/**
 * List all tasks with optional assignee filter
 * Query param: ?assignee=rufus or ?assignee=james or ?assignee=null
 */
export async function listTasks(req: Request, res: Response): Promise<void> {
  try {
    const assigneeParam = req.query.assignee as string | undefined;
    let assigneeFilter: string | null | undefined = undefined;
    
    if (assigneeParam !== undefined) {
      assigneeFilter = assigneeParam === 'null' ? null : assigneeParam;
    }
    
    const tasks = await taskService.getAllTasks(assigneeFilter);
    const response: ApiResponse<ListTasksResponse> = {
      success: true,
      data: {
        tasks,
        total: tasks.length,
      },
    };
    res.json(response);
  } catch (error) {
    console.error('Error listing tasks:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to list tasks',
    };
    res.status(500).json(response);
  }
}

/**
 * Get single task by ID
 */
export async function getTask(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);

    if (!task) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
    };
    res.json(response);
  } catch (error) {
    console.error('Error getting task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to get task',
    };
    res.status(500).json(response);
  }
}

/**
 * Create a new task
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<never> = {
        success: false,
        error: errors.array()[0]?.msg as string,
      };
      res.status(400).json(response);
      return;
    }

    const taskRequest = req.body as CreateTaskRequest;
    const task = await taskService.createTask(taskRequest);

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create task',
    };
    res.status(500).json(response);
  }
}

/**
 * Update an existing task
 */
export async function updateTask(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<never> = {
        success: false,
        error: errors.array()[0]?.msg as string,
      };
      res.status(400).json(response);
      return;
    }

    const { id } = req.params;
    const taskRequest = req.body as UpdateTaskRequest;
    const task = await taskService.updateTask(id, taskRequest);

    if (!task) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to update task',
    };
    res.status(500).json(response);
  }
}

/**
 * Delete a task
 */
export async function deleteTask(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await taskService.deleteTask(id);

    if (!deleted) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id },
    };
    res.json(response);
  } catch (error) {
    console.error('Error deleting task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to delete task',
    };
    res.status(500).json(response);
  }
}

/**
 * Move task between columns
 */
export async function moveTask(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<never> = {
        success: false,
        error: errors.array()[0]?.msg as string,
      };
      res.status(400).json(response);
      return;
    }

    const { id } = req.params;
    const { status } = req.body as MoveTaskRequest;
    const task = await taskService.moveTask(id, status);

    if (!task) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
    };
    res.json(response);
  } catch (error) {
    console.error('Error moving task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to move task',
    };
    res.status(500).json(response);
  }
}
