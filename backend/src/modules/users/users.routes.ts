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

// All user routes require SUPER_ADMIN
router.use(authenticate, requireRole(['SUPER_ADMIN']));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validate(createUserSchema), createUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
