import { Router } from 'express';
import { translateText, batchTranslateText, getLanguageBundle } from '../controllers/translationController';

const router = Router();

router.post('/translate', translateText);
router.post('/batch-translate', batchTranslateText);
router.get('/bundle/:lang', getLanguageBundle);

export default router;
