import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './company.controller';

const router = Router();

router.get('/:id', authenticate, asyncHandler(controller.getById));

router.use(authenticate, requireRole('COMPANY'));
router.get('/me', asyncHandler(controller.getProfile));
router.post('/me', asyncHandler(controller.createProfile));
router.put('/me', asyncHandler(controller.updateProfile));

export { router as companyRouter };
