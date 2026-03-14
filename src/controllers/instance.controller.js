import prisma from '../lib/prisma.js';
import { dockerService } from '../services/docker.service.js';
export class InstanceController {
    static async create(req, res) {
        const { subdomain } = req.body;
        const userId = req.user.userId;
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
                domain: process.env.BASE_DOMAIN || '',
            });
            await prisma.instance.update({
                where: { id: instance.id },
                data: {
                    containerId: container.id,
                    status: 'STOPPED'
                },
            });
            return res.status(201).json(instance);
        }
        catch (error) {
            return res.status(500).json({ message: 'Failed to create instance', error });
        }
    }
    static async start(req, res) {
        const { id } = req.params;
        const userId = req.user.userId;
        try {
            const instance = await prisma.instance.findUnique({ where: { id } });
            if (!instance || (instance.userId !== userId && req.user.role !== 'ADMIN')) {
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
        }
        catch (error) {
            return res.status(500).json({ message: 'Failed to start instance', error });
        }
    }
    static async stop(req, res) {
        const { id } = req.params;
        const userId = req.user.userId;
        try {
            const instance = await prisma.instance.findUnique({ where: { id } });
            if (!instance || (instance.userId !== userId && req.user.role !== 'ADMIN')) {
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
        }
        catch (error) {
            return res.status(500).json({ message: 'Failed to stop instance', error });
        }
    }
    static async remove(req, res) {
        const { id } = req.params;
        const userId = req.user.userId;
        try {
            const instance = await prisma.instance.findUnique({ where: { id } });
            if (!instance || (instance.userId !== userId && req.user.role !== 'ADMIN')) {
                return res.status(404).json({ message: 'Instance not found' });
            }
            if (instance.containerId) {
                await dockerService.removeInstance(instance.containerId);
            }
            await prisma.instance.delete({ where: { id } });
            return res.json({ message: 'Instance removed' });
        }
        catch (error) {
            return res.status(500).json({ message: 'Failed to remove instance', error });
        }
    }
    static async list(req, res) {
        const userId = req.user.userId;
        const query = req.user.role === 'ADMIN' ? {} : { where: { userId } };
        try {
            const instances = await prisma.instance.findMany(query);
            return res.json(instances);
        }
        catch (error) {
            return res.status(500).json({ message: 'Failed to list instances' });
        }
    }
}
//# sourceMappingURL=instance.controller.js.map