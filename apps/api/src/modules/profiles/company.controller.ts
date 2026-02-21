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

export async function uploadPhotos(req: Request, res: Response) {
  const companyId = await companyService.getCompanyIdByUserId(req.user!.userId);
  const files = (req.files as Express.Multer.File[]) || [];

  if (files.length === 0) {
    res.status(400).json({ message: 'No files uploaded' });
    return;
  }

  const photoData = files.map((f) => ({
    url: `/uploads/companies/${f.filename}`,
  }));

  const photos = await companyService.addPhotos(companyId, photoData);
  res.status(201).json({ data: photos });
}

export async function deletePhoto(req: Request, res: Response) {
  const companyId = await companyService.getCompanyIdByUserId(req.user!.userId);
  await companyService.deletePhoto(companyId, req.params.photoId);
  res.json({ message: 'Photo deleted' });
}

export async function uploadVideoFile(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'No video file uploaded' });
    return;
  }

  const videoUrl = `/uploads/companies/${file.filename}`;
  await companyService.setVideoUrl(req.user!.userId, videoUrl);
  res.status(201).json({ videoUrl });
}

export async function deleteVideo(req: Request, res: Response) {
  await companyService.setVideoUrl(req.user!.userId, null);
  res.json({ message: 'Video deleted' });
}
