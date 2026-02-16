import type { Request, Response } from 'express';
import * as matchesService from './matches.service';

export async function getMatches(req: Request, res: Response) {
  const matches = await matchesService.getMatches(req.user!.userId, req.user!.role);
  res.json({ data: matches });
}

export async function getById(req: Request, res: Response) {
  const match = await matchesService.getMatchById(req.user!.userId, req.params.id as string);
  res.json(match);
}
