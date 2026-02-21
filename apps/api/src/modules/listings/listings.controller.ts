import type { Request, Response } from 'express';
import * as listingsService from './listings.service';

export async function getListings(req: Request, res: Response) {
  const field = req.query.field as string | undefined;
  const canton = req.query.canton as string | undefined;
  const listings = await listingsService.getListings({ field, canton });
  res.json({ data: listings });
}

export async function getById(req: Request, res: Response) {
  const listing = await listingsService.getListingById(req.params.id as string);
  res.json(listing);
}

export async function create(req: Request, res: Response) {
  const listing = await listingsService.createListing(req.user!.userId, req.body);
  res.status(201).json(listing);
}

export async function update(req: Request, res: Response) {
  const listing = await listingsService.updateListing(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );
  res.json(listing);
}

export async function remove(req: Request, res: Response) {
  await listingsService.deleteListing(req.user!.userId, req.params.id as string);
  res.json({ message: 'Listing deactivated' });
}

export async function getMyListings(req: Request, res: Response) {
  const listings = await listingsService.getCompanyListings(req.user!.userId);
  res.json({ data: listings });
}
