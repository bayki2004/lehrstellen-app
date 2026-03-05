import type { Request, Response } from 'express';
import { z } from 'zod';
import * as swipesService from './swipes.service';
import { ApiError } from '../../utils/ApiError';

const swipeSchema = z.object({
  listingId: z.string().min(1, 'listingId is required'),
  direction: z.enum(['LEFT', 'RIGHT', 'SUPER']),
});

export async function getFeed(req: Request, res: Response) {
  const feed = await swipesService.getSwipeFeed(req.user!.userId);
  res.json({ data: feed });
}

export async function swipe(req: Request, res: Response) {
  const parsed = swipeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }
  const { listingId, direction } = parsed.data;
  const result = await swipesService.recordSwipe(req.user!.userId, listingId, direction);
  res.json(result);
}

export async function getRemaining(req: Request, res: Response) {
  const result = await swipesService.getSwipeRemaining(req.user!.userId);
  res.json(result);
}
