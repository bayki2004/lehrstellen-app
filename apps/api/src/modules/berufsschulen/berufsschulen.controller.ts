import type { Request, Response } from 'express';
import * as service from './berufsschulen.service';

export async function getAll(req: Request, res: Response) {
  const { canton, q, letter } = req.query as Record<string, string | undefined>;
  const schulen = await service.getBerufsschulen({ canton, q, letter });
  res.json({ data: schulen });
}

export async function getCantons(_req: Request, res: Response) {
  const cantons = await service.getBerufsschulenCantons();
  res.json({ data: cantons });
}

export async function getById(req: Request, res: Response) {
  const schule = await service.getBerufsschuleById(req.params.id);
  if (!schule) return res.status(404).json({ error: 'Berufsschule not found' });
  res.json({ data: schule });
}
