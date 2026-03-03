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

export async function uploadMotivationLetter(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const motivationLetterUrl = `/uploads/students/${file.filename}`;
  const profile = await studentService.updateStudentProfile(req.user!.userId, {
    motivationLetterUrl,
  });
  res.status(201).json({ motivationLetterUrl, profile });
}
