/**
 * Tag controller - HTTP request handlers
 */

import type { Request, Response } from 'express';
import type { Tag, ApiResponse } from '../../../contracts/types.js';
import * as tagService from '../services/tag.service.js';

/**
 * List all tags
 */
export async function listTags(_req: Request, res: Response): Promise<void> {
  try {
    const tags = await tagService.getAllTags();
    const response: ApiResponse<Tag[]> = {
      success: true,
      data: tags,
    };
    res.json(response);
  } catch (error) {
    console.error('Error listing tags:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to list tags',
    };
    res.status(500).json(response);
  }
}
