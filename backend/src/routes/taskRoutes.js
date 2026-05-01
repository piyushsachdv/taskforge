import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  runTask
} from '../controllers/taskController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/:id/run', runTask);

export default router;