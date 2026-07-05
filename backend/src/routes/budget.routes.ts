import { Router } from 'express';
import { getBudgets, createBudget } from '../controllers/budget.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Protect all budget routes
router.use(verifyToken);

router.get('/', getBudgets);
router.post('/', createBudget);

export default router;
