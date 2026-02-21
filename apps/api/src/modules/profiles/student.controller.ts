import type { Request, Response } from 'express';
import * as studentService from './student.service';

export async function getProfile(req: Request, res: Response) {
  const profile = await studentService.getStudentProfile(req.user!.userId);
  res.json(profile);
}

export async function createProfile(req: Request, res: Response) {
  const profile = await studentService.createStudentProfile(req.user!.userId, req.body);
  res.status(201).json(profile);
}

export async function updateProfile(req: Request, res: Response) {
  const profile = await studentService.updateStudentProfile(req.user!.userId, req.body);
  res.json(profile);
}
