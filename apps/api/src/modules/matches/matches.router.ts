import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';
import * as controller from './matches.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.getMatches));
router.get('/:id', asyncHandler(controller.getById));

export { router as matchesRouter };
