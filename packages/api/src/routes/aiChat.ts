import { Router } from 'express';
import multer from 'multer';
import { aiChatResponse, aiImageAnalysis } from '../controllers/aiChatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/message', authMiddleware, aiChatResponse);
router.post('/analyze-photo', authMiddleware, upload.single('photo'), aiImageAnalysis);

export default router;
