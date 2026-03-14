import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;
