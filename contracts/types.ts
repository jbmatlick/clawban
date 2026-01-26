/**
 * Shared TypeScript types for Clawban
 * Used by both frontend and backend for type safety
 */

/**
 * Model strategy for task execution
 */
export type ModelStrategy = 'opus-planning' | 'opus-coding' | 'sonnet-coding' | 'mixed';

/**
 * Task status in the Kanban board
 */
export type TaskStatus = 'new' | 'approved' | 'in-progress' | 'complete';

/**
 * LLM usage entry for tracking costs
 */
export interface LLMUsage {
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost: number;
  timestamp: string;
}

/**
 * Task entity
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  model_strategy: ModelStrategy;
  estimated_token_cost: number;
  estimated_dollar_cost: number;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  llm_usage: LLMUsage[];
}

/**
 * Create task request body
 */
export interface CreateTaskRequest {
  title: string;
  description: string;
  model_strategy: ModelStrategy;
  estimated_token_cost?: number;
  estimated_dollar_cost?: number;
}

/**
 * Update task request body
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  model_strategy?: ModelStrategy;
  estimated_token_cost?: number;
  estimated_dollar_cost?: number;
  status?: TaskStatus;
}

/**
 * Move task request body
 */
export interface MoveTaskRequest {
  status: TaskStatus;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * List tasks response
 */
export interface ListTasksResponse {
  tasks: Task[];
  total: number;
}
