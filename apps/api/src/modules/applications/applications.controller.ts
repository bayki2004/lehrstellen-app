import type { Request, Response } from 'express';
import * as applicationsService from './applications.service';

export async function getAll(req: Request, res: Response) {
  const apps = await applicationsService.getApplications(req.user!.userId, req.user!.role);
  res.json({ data: apps });
}

export async function getById(req: Request, res: Response) {
  const app = await applicationsService.getApplicationById(req.params.id as string);
  res.json(app);
}

export async function create(req: Request, res: Response) {
  const app = await applicationsService.createApplication(req.user!.userId, req.body.matchId);
  res.status(201).json(app);
}

export async function updateStatus(req: Request, res: Response) {
  const { status, note } = req.body;
  const app = await applicationsService.updateApplicationStatus(
    req.params.id as string,
    status,
    note,
  );
  res.json(app);
}
