import { Router } from 'express';
import { login, getMe, changePassword } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate, loginSchema, changePasswordSchema } from '../../utils/validation';

const router = Router();

// POST /api/auth/login — public
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me — protected
router.get('/me', authenticate, getMe);

// POST /api/auth/logout — protected
router.post('/logout', authenticate, (req, res, next) => {
  const { userId } = req.user!;
  import('../../config/prisma').then(({ prisma }) => {
    prisma.session.updateMany({
      where: { userId, logoutTime: null },
      data: { logoutTime: new Date() }
    }).then(() => res.json({ success: true }))
      .catch(next);
  });
});

// POST /api/auth/change-password — protected
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
