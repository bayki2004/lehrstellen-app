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

export async function getExtendedProfile(req: Request, res: Response) {
  const profile = await studentService.getStudentProfileExtended(req.user!.userId);
  res.json(profile);
}

export async function updateExtendedProfile(req: Request, res: Response) {
  const profile = await studentService.updateStudentProfileExtended(req.user!.userId, req.body);
  res.json(profile);
}

// Schools
export async function addSchool(req: Request, res: Response) {
  const school = await studentService.addSchool(req.user!.userId, req.body);
  res.status(201).json(school);
}

export async function removeSchool(req: Request, res: Response) {
  await studentService.removeSchool(req.user!.userId, req.params.id as string);
  res.status(204).send();
}

// Skills
export async function addSkill(req: Request, res: Response) {
  const skill = await studentService.addSkill(req.user!.userId, req.body.name);
  res.status(201).json(skill);
}

export async function removeSkill(req: Request, res: Response) {
  await studentService.removeSkill(req.user!.userId, req.params.id as string);
  res.status(204).send();
}

// Languages
export async function addLanguage(req: Request, res: Response) {
  const lang = await studentService.addLanguage(req.user!.userId, req.body);
  res.status(201).json(lang);
}

export async function removeLanguage(req: Request, res: Response) {
  await studentService.removeLanguage(req.user!.userId, req.params.id as string);
  res.status(204).send();
}

// Schnupperlehren
export async function addSchnupperlehre(req: Request, res: Response) {
  const entry = await studentService.addSchnupperlehre(req.user!.userId, req.body);
  res.status(201).json(entry);
}

export async function removeSchnupperlehre(req: Request, res: Response) {
  await studentService.removeSchnupperlehre(req.user!.userId, req.params.id as string);
  res.status(204).send();
}

// Passende Berufe
export async function getPassendeBerufe(req: Request, res: Response) {
  const berufe = await studentService.getPassendeBerufe(req.user!.userId);
  res.json(berufe);
}
