import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate, createUserSchema, updateUserSchema } from '../../utils/validation';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
} from './users.controller';

const router = Router();

// Base authentication
router.use(authenticate);

router.get('/', requireRole(['ADMIN', 'SUPER_ADMIN']), getAllUsers);
router.get('/:id', requireRole(['SUPER_ADMIN']), getUserById);
router.post('/', requireRole(['SUPER_ADMIN']), validate(createUserSchema), createUser);
router.patch('/:id', requireRole(['SUPER_ADMIN']), validate(updateUserSchema), updateUser);
router.delete('/:id', requireRole(['SUPER_ADMIN']), deleteUser);

export default router;
