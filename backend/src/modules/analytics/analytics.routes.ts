import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { getDailyAnalytics, getMonthlyAnalytics, getTodaySummary, manualAdjust } from './analytics.controller';

const router = Router();
router.use(authenticate);

// Today summary — all roles (own data for USER, all data for ADMIN+)
router.get('/today-summary', getTodaySummary);

// Daily + monthly — ADMIN+ only
router.get('/daily', requireRole(['ADMIN', 'SUPER_ADMIN']), getDailyAnalytics);
router.get('/monthly', requireRole(['ADMIN', 'SUPER_ADMIN']), getMonthlyAnalytics);
router.post('/adjust', requireRole(['SUPER_ADMIN']), manualAdjust);

export default router;
