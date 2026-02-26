import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './berufsschulen.controller';

const router = Router();

// Public endpoints — reference data, no auth required
router.get('/', asyncHandler(controller.getAll));
router.get('/cantons', asyncHandler(controller.getCantons));
router.get('/:id', asyncHandler(controller.getById));

export { router as berufsschulenRouter };
