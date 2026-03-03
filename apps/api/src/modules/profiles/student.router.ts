import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import { uploadDocument } from '../../middleware/upload';
import * as controller from './student.controller';

const router = Router();

router.use(authenticate, requireRole('STUDENT'));

router.get('/me', asyncHandler(controller.getProfile));
router.post('/me', asyncHandler(controller.createProfile));
router.put('/me', asyncHandler(controller.updateProfile));
router.post('/me/motivation-letter', uploadDocument.single('file'), asyncHandler(controller.uploadMotivationLetter));

export { router as studentRouter };
