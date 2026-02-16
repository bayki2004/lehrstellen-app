import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './student.controller';

const router = Router();

router.use(authenticate, requireRole('STUDENT'));

router.get('/me', asyncHandler(controller.getProfile));
router.post('/me', asyncHandler(controller.createProfile));
router.put('/me', asyncHandler(controller.updateProfile));

export { router as studentRouter };
