/**
 * Task service tests
 * 
 * Note: These tests require Supabase to be configured.
 * They will be skipped if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set.
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import * as taskService from './task.service.js';
import type { CreateTaskRequest } from '../../../contracts/types.js';

const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const describeIfSupabase = hasSupabase ? describe : describe.skip;

describeIfSupabase('Task Service', () => {
  const mockTask: CreateTaskRequest = {
    title: 'Test Task',
    description: 'Test description',
    model_strategy: 'opus-coding',
    estimated_token_cost: 1000,
    estimated_dollar_cost: 0.5,
  };

  beforeAll(() => {
    if (!hasSupabase) {
      console.log('⚠️ Skipping Task Service tests - Supabase not configured');
    }
  });

  describe('createTask', () => {
    test('should create a new task with all fields', async () => {
      const task = await taskService.createTask(mockTask);

      expect(task).toHaveProperty('id');
      expect(task.title).toBe(mockTask.title);
      expect(task.description).toBe(mockTask.description);
      expect(task.model_strategy).toBe(mockTask.model_strategy);
      expect(task.status).toBe('new');
      expect(task.llm_usage).toEqual([]);
      expect(task.completed_at).toBeNull();
    });

    test('should set default costs to 0 if not provided', async () => {
      const minimalTask: CreateTaskRequest = {
        title: 'Minimal Task',
        description: 'Description',
        model_strategy: 'sonnet-coding',
      };

      const task = await taskService.createTask(minimalTask);

      expect(task.estimated_token_cost).toBe(0);
      expect(task.estimated_dollar_cost).toBe(0);
    });
  });

  describe('getAllTasks', () => {
    test('should return all tasks', async () => {
      const tasks = await taskService.getAllTasks();
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('getTaskById', () => {
    test('should return a task by id', async () => {
      const created = await taskService.createTask(mockTask);
      const found = await taskService.getTaskById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    test('should return null for non-existent id', async () => {
      const found = await taskService.getTaskById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('updateTask', () => {
    test('should update task fields', async () => {
      const created = await taskService.createTask(mockTask);
      const updated = await taskService.updateTask(created.id, {
        title: 'Updated Title',
        status: 'approved',
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.status).toBe('approved');
    });

    test('should set completed_at when status changes to complete', async () => {
      const created = await taskService.createTask(mockTask);
      const updated = await taskService.updateTask(created.id, {
        status: 'complete',
      });

      expect(updated?.completed_at).not.toBeNull();
    });

    test('should return null for non-existent id', async () => {
      const updated = await taskService.updateTask('non-existent-id', {
        title: 'New Title',
      });

      expect(updated).toBeNull();
    });
  });

  describe('deleteTask', () => {
    test('should delete a task', async () => {
      const created = await taskService.createTask(mockTask);
      const deleted = await taskService.deleteTask(created.id);

      expect(deleted).toBe(true);

      const found = await taskService.getTaskById(created.id);
      expect(found).toBeNull();
    });

    test('should return false for non-existent id', async () => {
      const deleted = await taskService.deleteTask('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('moveTask', () => {
    test('should move task to new status', async () => {
      const created = await taskService.createTask(mockTask);
      const moved = await taskService.moveTask(created.id, 'in-progress');

      expect(moved).not.toBeNull();
      expect(moved?.status).toBe('in-progress');
    });
  });
});

// Always have at least one test so the suite doesn't fail
describe('Task Service (configuration)', () => {
  test('should detect Supabase configuration', () => {
    if (hasSupabase) {
      expect(process.env.SUPABASE_URL).toBeDefined();
    } else {
      console.log('ℹ️ Supabase not configured - integration tests skipped');
      expect(true).toBe(true);
    }
  });
});
