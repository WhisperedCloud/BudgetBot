import { Router } from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budget.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Protect all budget routes
router.use(verifyToken);

router.get('/', getBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
