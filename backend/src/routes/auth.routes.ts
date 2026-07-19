import { Router } from 'express';
import { register, login, updateSettings, updatePassword, generate2FA, verify2FA, disable2FA, verifyLogin2FA } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/2fa', verifyLogin2FA);
router.put('/settings', verifyToken, updateSettings);
router.put('/password', verifyToken, updatePassword);
router.post('/2fa/generate', verifyToken, generate2FA);
router.post('/2fa/verify', verifyToken, verify2FA);
router.post('/2fa/disable', verifyToken, disable2FA);

export default router;
