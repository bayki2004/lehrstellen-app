import type { Request, Response } from 'express';
import * as swipesService from './swipes.service';

export async function getFeed(req: Request, res: Response) {
  const feed = await swipesService.getSwipeFeed(req.user!.userId);
  res.json({ data: feed });
}

export async function swipe(req: Request, res: Response) {
  const { listingId, direction } = req.body;
  const result = await swipesService.recordSwipe(req.user!.userId, listingId, direction);
  res.json(result);
}
