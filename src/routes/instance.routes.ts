import { Router } from 'express';
import { InstanceController } from '../controllers/instance.controller.js';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Apply JWT authentication to all instance routes
router.use(authenticateJWT);

router.post('/', InstanceController.create);
router.get('/', InstanceController.list);
router.post('/:id/start', InstanceController.start);
router.post('/:id/stop', InstanceController.stop);
router.delete('/:id', InstanceController.remove);

export default router;
