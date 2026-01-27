/**
 * Tag routes
 */

import { Router } from 'express';
import * as tagController from '../controllers/tag.controller.js';

const router = Router();

// GET /api/tags - List all tags
router.get('/', tagController.listTags);

export default router;
