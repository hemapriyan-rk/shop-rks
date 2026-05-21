import { Router } from 'express';
import * as controller from './system.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// SSE Stream — accessible to all authenticated users to receive notifications
router.get('/events', authenticate, controller.eventStream);

// Config — Read by App, Write by Super Admin
router.get('/config', controller.getConfig);
router.patch('/config', authenticate, requireRole('SUPER_ADMIN'), controller.updateConfig);
router.get('/health-stats', authenticate, requireRole('SUPER_ADMIN'), controller.getSystemHealth);

// Sessions — Super Admin only
router.get('/sessions', authenticate, requireRole('SUPER_ADMIN'), controller.getSessions);
router.post('/sessions/:id/kick', authenticate, requireRole('SUPER_ADMIN'), controller.kickSession);
router.post('/sessions/:userId/message', authenticate, requireRole('SUPER_ADMIN'), controller.messageUser);

export default router;
