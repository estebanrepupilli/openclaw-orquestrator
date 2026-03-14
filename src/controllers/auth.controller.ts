import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, role } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const passwordHash = await AuthService.hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: role || 'USER',
        },
      });

      return res.status(201).json({ message: 'User created', userId: user.id });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await AuthService.comparePassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = AuthService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return res.json({ token, role: user.role });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
