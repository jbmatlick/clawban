/**
 * Task routes
 */

import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import {
  createTaskValidators,
  updateTaskValidators,
  moveTaskValidators,
  idParamValidator,
} from '../middleware/validators.js';

const router = Router();

// GET /api/tasks - List all tasks
router.get('/', taskController.listTasks);

// GET /api/tasks/:id - Get single task
router.get('/:id', idParamValidator, taskController.getTask);

// POST /api/tasks - Create task
router.post('/', createTaskValidators, taskController.createTask);

// PATCH /api/tasks/:id - Update task
router.patch('/:id', [...idParamValidator, ...updateTaskValidators], taskController.updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', idParamValidator, taskController.deleteTask);

// POST /api/tasks/:id/move - Move task between columns
router.post('/:id/move', [...idParamValidator, ...moveTaskValidators], taskController.moveTask);

export default router;
