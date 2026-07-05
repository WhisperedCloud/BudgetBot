import { Router } from 'express';
import { getExpenses, createExpense, getDashboardSummary } from '../controllers/expense.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Protect all expense routes
router.use(verifyToken);

router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/summary', getDashboardSummary);

export default router;
