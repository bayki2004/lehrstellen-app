import type { Request, Response } from 'express';
import * as companyService from './company.service';

export async function getProfile(req: Request, res: Response) {
  const profile = await companyService.getCompanyProfile(req.user!.userId);
  res.json(profile);
}

export async function createProfile(req: Request, res: Response) {
  const profile = await companyService.createCompanyProfile(req.user!.userId, req.body);
  res.status(201).json(profile);
}

export async function updateProfile(req: Request, res: Response) {
  const profile = await companyService.updateCompanyProfile(req.user!.userId, req.body);
  res.json(profile);
}

export async function getById(req: Request, res: Response) {
  const profile = await companyService.getCompanyById(req.params.id as string);
  res.json(profile);
}
