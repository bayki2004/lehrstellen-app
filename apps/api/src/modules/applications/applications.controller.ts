import type { Request, Response } from 'express';
import { z } from 'zod';
import * as applicationsService from './applications.service';
import { ApiError } from '../../utils/ApiError';

const createApplicationSchema = z.object({
  matchId: z.string().min(1, 'matchId is required'),
  motivationAnswers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional().default([]),
  verfuegbarkeit: z.string().optional(),
  relevanteErfahrungen: z.array(z.string()).optional().default([]),
  fragenAnBetrieb: z.string().optional(),
  schnupperlehreWunsch: z.boolean().optional().default(false),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'VIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']),
  note: z.string().optional(),
});

export async function getAll(req: Request, res: Response) {
  const apps = await applicationsService.getApplications(req.user!.userId, req.user!.role);
  res.json({ data: apps });
}

export async function getById(req: Request, res: Response) {
  const app = await applicationsService.getApplicationById(req.params.id as string);
  res.json(app);
}

export async function create(req: Request, res: Response) {
  const parsed = createApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }
  const app = await applicationsService.createApplication(req.user!.userId, parsed.data);
  res.status(201).json(app);
}

export async function getDossier(req: Request, res: Response) {
  const dossier = await applicationsService.getApplicationDossier(
    req.params.id as string,
    req.user!.userId,
  );
  res.json(dossier);
}

export async function updateStatus(req: Request, res: Response) {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }
  const app = await applicationsService.updateApplicationStatus(
    req.params.id as string,
    parsed.data.status,
    parsed.data.note,
  );
  res.json(app);
}
