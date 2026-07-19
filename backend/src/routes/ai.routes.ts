import { Router } from 'express';
import { parseAndSaveExpense, parseAndSaveBudget, getInsights, processVoice } from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyToken);

router.post('/parse-expense', parseAndSaveExpense);
router.post('/parse-budget', parseAndSaveBudget);
router.get('/insights', getInsights);
router.post('/voice', upload.single('audio'), processVoice);

export default router;
