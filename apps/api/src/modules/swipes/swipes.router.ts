import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './swipes.controller';

const router = Router();

router.use(authenticate, requireRole('STUDENT'));

router.get('/feed', asyncHandler(controller.getFeed));
router.post('/', asyncHandler(controller.swipe));

export { router as swipesRouter };
