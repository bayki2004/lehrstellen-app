import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import { uploadPhotos, uploadVideo } from '../../middleware/upload';
import * as controller from './company.controller';

const router = Router();

// Authenticated company routes (must be before /:id to avoid "me" being treated as an ID)
router.use(authenticate);
router.get('/me', requireRole('COMPANY'), asyncHandler(controller.getProfile));
router.post('/me', requireRole('COMPANY'), asyncHandler(controller.createProfile));
router.put('/me', requireRole('COMPANY'), asyncHandler(controller.updateProfile));

// Media upload routes
router.post('/me/photos', requireRole('COMPANY'), uploadPhotos.array('photos', 10), asyncHandler(controller.uploadPhotos));
router.delete('/me/photos/:photoId', requireRole('COMPANY'), asyncHandler(controller.deletePhoto));
router.post('/me/video', requireRole('COMPANY'), uploadVideo.single('video'), asyncHandler(controller.uploadVideoFile));
router.delete('/me/video', requireRole('COMPANY'), asyncHandler(controller.deleteVideo));

// Public-ish route (any authenticated user can view a company by ID)
router.get('/:id', asyncHandler(controller.getById));

export { router as companyRouter };
