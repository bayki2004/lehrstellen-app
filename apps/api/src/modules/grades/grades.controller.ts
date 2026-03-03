import type { Request, Response } from 'express';
import * as gradesService from './grades.service';

export async function getGrades(req: Request, res: Response) {
  const grades = await gradesService.getStudentGrades(req.user!.userId);
  res.json(grades);
}

export async function saveGrade(req: Request, res: Response) {
  const grade = await gradesService.saveGrade(req.user!.userId, req.body);
  res.status(201).json(grade);
}

export async function deleteGrade(req: Request, res: Response) {
  await gradesService.deleteGrade(req.user!.userId, req.params.id as string);
  res.status(204).send();
}
