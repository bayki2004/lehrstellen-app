import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './grades.controller';

const router = Router();

router.use(authenticate, requireRole('STUDENT'));

router.get('/', asyncHandler(controller.getGrades));
router.post('/', asyncHandler(controller.saveGrade));
router.delete('/:id', asyncHandler(controller.deleteGrade));

export { router as gradesRouter };
