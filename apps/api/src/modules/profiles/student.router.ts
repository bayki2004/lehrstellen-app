import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './student.controller';

const router = Router();

router.use(authenticate, requireRole('STUDENT'));

// Basic profile
router.get('/me', asyncHandler(controller.getProfile));
router.post('/me', asyncHandler(controller.createProfile));
router.put('/me', asyncHandler(controller.updateProfile));

// Extended profile
router.get('/me/extended', asyncHandler(controller.getExtendedProfile));
router.put('/me/extended', asyncHandler(controller.updateExtendedProfile));

// Schools
router.post('/me/schools', asyncHandler(controller.addSchool));
router.delete('/me/schools/:id', asyncHandler(controller.removeSchool));

// Skills
router.post('/me/skills', asyncHandler(controller.addSkill));
router.delete('/me/skills/:id', asyncHandler(controller.removeSkill));

// Languages
router.post('/me/languages', asyncHandler(controller.addLanguage));
router.delete('/me/languages/:id', asyncHandler(controller.removeLanguage));

// Schnupperlehren
router.post('/me/schnupperlehren', asyncHandler(controller.addSchnupperlehre));
router.delete('/me/schnupperlehren/:id', asyncHandler(controller.removeSchnupperlehre));

// Passende Berufe
router.get('/me/passende-berufe', asyncHandler(controller.getPassendeBerufe));

export { router as studentRouter };
