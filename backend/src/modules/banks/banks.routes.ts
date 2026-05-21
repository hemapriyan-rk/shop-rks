import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../utils/validation';
import { z } from 'zod';
import { getBanks, getBankAnalytics, depositToBank, setBalance } from './banks.controller';

const router = Router();
router.use(authenticate, requireRole('ADMIN', 'SUPER_ADMIN'));

const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  note: z.string().max(500).optional(),
});

const setBalanceSchema = z.object({
  balance: z.number().nonnegative('Balance cannot be negative'),
  note: z.string().max(500).optional(),
});

router.get('/', getBanks);
router.get('/analytics', getBankAnalytics);
router.patch('/:id/deposit', validate(depositSchema), depositToBank);
router.patch('/:id/balance', requireRole('SUPER_ADMIN'), validate(setBalanceSchema), setBalance);

export default router;
