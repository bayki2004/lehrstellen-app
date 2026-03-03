import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';
import * as controller from './applications.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));
router.get('/:id/dossier', asyncHandler(controller.getDossier));
router.post('/', asyncHandler(controller.create));
router.put('/:id/status', asyncHandler(controller.updateStatus));

export { router as applicationsRouter };
