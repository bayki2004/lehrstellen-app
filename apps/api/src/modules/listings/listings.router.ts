import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './listings.controller';

const router = Router();

router.get('/', authenticate, asyncHandler(controller.getListings));
router.get('/mine', authenticate, requireRole('COMPANY'), asyncHandler(controller.getMyListings));
router.get('/:id', authenticate, asyncHandler(controller.getById));
router.post('/', authenticate, requireRole('COMPANY'), asyncHandler(controller.create));
router.put('/:id', authenticate, requireRole('COMPANY'), asyncHandler(controller.update));
router.delete('/:id', authenticate, requireRole('COMPANY'), asyncHandler(controller.remove));

export { router as listingsRouter };
