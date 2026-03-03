import type { Request, Response } from 'express';
import { QUIZ_QUESTIONS, CULTURE_QUIZ_QUESTIONS } from '@lehrstellen/shared';
import * as quizService from './quiz.service';

export async function getQuestions(_req: Request, res: Response) {
  res.json({ questions: QUIZ_QUESTIONS });
}

export async function submitQuiz(req: Request, res: Response) {
  const result = await quizService.submitQuiz(req.user!.userId, req.body.answers);
  res.json(result);
}

export async function getCultureQuestions(_req: Request, res: Response) {
  res.json({ questions: CULTURE_QUIZ_QUESTIONS });
}

export async function submitCultureQuiz(req: Request, res: Response) {
  const result = await quizService.submitCultureQuiz(req.user!.userId, req.body.answers);
  res.json(result);
}

export async function submitBuildYourDayQuiz(req: Request, res: Response) {
  const result = await quizService.submitBuildYourDayQuiz(req.user!.userId, req.body.hollandCodes);
  res.json(result);
}
