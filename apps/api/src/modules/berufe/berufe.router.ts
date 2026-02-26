import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './berufe.controller';

const router = Router();

// Public endpoints — reference data, no auth required
router.get('/', asyncHandler(controller.getAll));
router.get('/fields', asyncHandler(controller.getFields));

// Auth-protected — favorites (must come before /:code)
router.get('/favorites', authenticate, requireRole('STUDENT'), asyncHandler(controller.getFavorites));

// Auth-protected — personalized matches
router.get('/matches', authenticate, requireRole('STUDENT'), asyncHandler(controller.getMatches));

// Public — single beruf detail (must come after /favorites and /matches)
router.get('/:code', asyncHandler(controller.getByCode));

// Public — lehrstellen for a specific beruf
router.get('/:code/lehrstellen', asyncHandler(controller.getLehrstellen));

// Auth-protected — toggle favorite beruf
router.post('/:code/favorite', authenticate, requireRole('STUDENT'), asyncHandler(controller.toggleFavorite));

export { router as berufeRouter };
