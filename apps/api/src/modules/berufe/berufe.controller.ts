import type { Request, Response } from 'express';
import { prisma } from '@lehrstellen/database';
import * as service from './berufe.service';

export async function getAll(req: Request, res: Response) {
  const { letter, field, q, type } = req.query as Record<string, string | undefined>;
  const berufe = await service.getBerufe({ letter, field, q, type });
  res.json({ data: berufe });
}

export async function getFields(_req: Request, res: Response) {
  const fields = await service.getBerufeFields();
  res.json({ data: fields });
}

export async function getByCode(req: Request, res: Response) {
  const beruf = await service.getBerufByCode(req.params.code);
  if (!beruf) return res.status(404).json({ error: 'Beruf not found' });
  res.json({ data: beruf });
}

export async function getMatches(req: Request, res: Response) {
  const matches = await service.getBerufeMatches(req.user!.userId);
  res.json({ data: matches });
}

export async function getLehrstellen(req: Request, res: Response) {
  const data = await service.getLehrstellenByBerufCode(req.params.code);
  res.json({ data });
}

export async function getFavorites(req: Request, res: Response) {
  const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const favorites = await service.getFavoriteBerufe(student.id);
  res.json({ data: favorites });
}

export async function toggleFavorite(req: Request, res: Response) {
  const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const result = await service.toggleFavoriteBeruf(student.id, req.params.code);
  res.json({ data: result });
}
