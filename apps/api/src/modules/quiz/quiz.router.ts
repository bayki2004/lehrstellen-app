import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './quiz.controller';

const router = Router();

router.get('/questions', asyncHandler(controller.getQuestions));
router.post('/submit', authenticate, requireRole('STUDENT'), asyncHandler(controller.submitQuiz));
router.get('/culture-questions', asyncHandler(controller.getCultureQuestions));
router.post('/culture-submit', authenticate, requireRole('STUDENT'), asyncHandler(controller.submitCultureQuiz));
router.post('/submit-profile', authenticate, requireRole('STUDENT'), asyncHandler(controller.submitBuildYourDayQuiz));

export { router as quizRouter };
