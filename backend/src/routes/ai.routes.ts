import { Router } from 'express';
import { parseAndSaveExpense, parseAndSaveBudget, getInsights } from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.use(verifyToken);

router.post('/parse-expense', parseAndSaveExpense);
router.post('/parse-budget', parseAndSaveBudget);
router.get('/insights', getInsights);

export default router;
