/**
 * Request validators using express-validator
 */

import { body } from 'express-validator';

const MODEL_STRATEGIES = ['opus-planning', 'opus-coding', 'sonnet-coding', 'mixed'];
const TASK_STATUSES = ['new', 'approved', 'in-progress', 'complete'];

export const createTaskValidators = [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  body('model_strategy')
    .isIn(MODEL_STRATEGIES)
    .withMessage(`Model strategy must be one of: ${MODEL_STRATEGIES.join(', ')}`),
  body('estimated_token_cost')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated token cost must be a positive integer'),
  body('estimated_dollar_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated dollar cost must be a positive number'),
];

export const updateTaskValidators = [
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty'),
  body('model_strategy')
    .optional()
    .isIn(MODEL_STRATEGIES)
    .withMessage(`Model strategy must be one of: ${MODEL_STRATEGIES.join(', ')}`),
  body('estimated_token_cost')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated token cost must be a positive integer'),
  body('estimated_dollar_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated dollar cost must be a positive number'),
  body('status')
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
];

export const moveTaskValidators = [
  body('status')
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
];
