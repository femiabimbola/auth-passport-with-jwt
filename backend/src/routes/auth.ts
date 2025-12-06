import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  refresh,
  logout,
  me,
} from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  login
);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', passport.authenticate('jwt', { session: false }), me);

export default router;
