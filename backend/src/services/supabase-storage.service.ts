/**
 * Supabase storage service for task persistence
 * Replaces JSON file-based storage
 */

import { supabase } from '../lib/supabase.js';
import type { Task } from '../../../contracts/types.js';

interface TasksData {
  tasks: Task[];
}

/**
 * Check if Supabase is available
 */
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}

/**
 * Read all tasks from Supabase
 */
export async function readData<T>(): Promise<T> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase read error:', error);
    throw new Error(`Failed to read tasks: ${error.message}`);
  }

  return { tasks: data || [] } as T;
}

/**
 * Write all tasks to Supabase (full replace - used for compatibility)
 * Note: For efficiency, prefer individual CRUD operations
 */
export async function writeData<T extends TasksData>(data: T): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // This is a full replace operation - delete all and insert
  // Only use this for migration, prefer individual operations
  const { error: deleteError } = await supabase
    .from('tasks')
    .delete()
    .neq('id', ''); // Delete all

  if (deleteError) {
    console.error('Supabase delete error:', deleteError);
    throw new Error(`Failed to clear tasks: ${deleteError.message}`);
  }

  if (data.tasks.length > 0) {
    const { error: insertError } = await supabase
      .from('tasks')
      .insert(data.tasks);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw new Error(`Failed to insert tasks: ${insertError.message}`);
    }
  }
}

/**
 * Insert a single task
 */
export async function insertTask(task: Task): Promise<Task> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error(`Failed to insert task: ${error.message}`);
  }

  return data;
}

/**
 * Update a single task
 */
export async function updateTaskById(id: string, updates: Partial<Task>): Promise<Task | null> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Supabase update error:', error);
    throw new Error(`Failed to update task: ${error.message}`);
  }

  return data;
}

/**
 * Delete a single task
 */
export async function deleteTaskById(id: string): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error, count } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete task: ${error.message}`);
  }

  return (count ?? 0) > 0;
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Supabase read error:', error);
    throw new Error(`Failed to get task: ${error.message}`);
  }

  return data;
}

/**
 * Lock wrapper - Supabase handles concurrency, so this is a no-op
 */
export async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}
