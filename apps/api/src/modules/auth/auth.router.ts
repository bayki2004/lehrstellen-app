import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';
import * as controller from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(controller.register));
router.post('/login', validate(loginSchema), asyncHandler(controller.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(controller.refresh));
router.post('/logout', asyncHandler(controller.logout));

export { router as authRouter };
