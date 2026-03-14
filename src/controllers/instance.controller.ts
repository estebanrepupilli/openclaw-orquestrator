import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { dockerService } from '../services/docker.service.js';

export class InstanceController {
  static async create(req: AuthRequest, res: Response) {
    const { subdomain } = req.body;
    const userId = req.user!.userId;

    try {
      // Create record in DB first
      const instance = await prisma.instance.create({
        data: {
          userId,
          subdomain,
          status: 'CREATING',
        },
      });

      // Orchestrate Docker
      const container = await dockerService.createInstance({
        instanceId: instance.id,
        subdomain,
        domain: process.env.BASE_DOMAIN || 'midominio.com',
      });

      await prisma.instance.update({
        where: { id: instance.id },
        data: {
          containerId: container.id,
          status: 'STOPPED'
        },
      });

      return res.status(201).json(instance);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create instance', error });
    }
  }

  static async start(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    try {
      const instance = await prisma.instance.findUnique({ where: { id } });

      if (!instance || (instance.userId !== userId && req.user!.role !== 'ADMIN')) {
        return res.status(404).json({ message: 'Instance not found' });
      }

      if (!instance.containerId) {
        return res.status(400).json({ message: 'Container not initialized' });
      }

      await dockerService.startInstance(instance.containerId);
      await prisma.instance.update({
        where: { id },
        data: { status: 'RUNNING' },
      });

      return res.json({ message: 'Instance started' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to start instance', error });
    }
  }

  static async stop(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    try {
      const instance = await prisma.instance.findUnique({ where: { id } });

      if (!instance || (instance.userId !== userId && req.user!.role !== 'ADMIN')) {
        return res.status(404).json({ message: 'Instance not found' });
      }

      if (!instance.containerId) {
        return res.status(400).json({ message: 'Container not initialized' });
      }

      await dockerService.stopInstance(instance.containerId);
      await prisma.instance.update({
        where: { id },
        data: { status: 'STOPPED' },
      });

      return res.json({ message: 'Instance stopped' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to stop instance', error });
    }
  }

  static async remove(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    try {
      const instance = await prisma.instance.findUnique({ where: { id } });

      if (!instance || (instance.userId !== userId && req.user!.role !== 'ADMIN')) {
        return res.status(404).json({ message: 'Instance not found' });
      }

      if (instance.containerId) {
        await dockerService.removeInstance(instance.containerId);
      }

      await prisma.instance.delete({ where: { id } });

      return res.json({ message: 'Instance removed' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to remove instance', error });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const query: any = req.user!.role === 'ADMIN' ? {} : { where: { userId } };

    try {
      const instances = await prisma.instance.findMany(query);
      return res.json(instances);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to list instances' });
    }
  }
}
