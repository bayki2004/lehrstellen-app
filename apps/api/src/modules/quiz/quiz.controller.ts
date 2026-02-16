import type { Request, Response } from 'express';
import { QUIZ_QUESTIONS } from '@lehrstellen/shared';
import * as quizService from './quiz.service';

export async function getQuestions(_req: Request, res: Response) {
  res.json({ questions: QUIZ_QUESTIONS });
}

export async function submitQuiz(req: Request, res: Response) {
  const result = await quizService.submitQuiz(req.user!.userId, req.body.answers);
  res.json(result);
}
