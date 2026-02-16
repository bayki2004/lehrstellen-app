import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';
import * as controller from './chat.controller';

const router = Router();

router.use(authenticate);

router.get('/:matchId/messages', asyncHandler(controller.getMessages));
router.post('/:matchId/messages', asyncHandler(controller.sendMessage));
router.put('/:matchId/read', asyncHandler(controller.markRead));

export { router as chatRouter };
