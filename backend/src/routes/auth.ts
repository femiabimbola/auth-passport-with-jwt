import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  refresh,
  logout,
  me,
} from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
// router.get(
//   '/me',
//   passport.authenticate('jwt', { session: false, failWithError: true }),
//   me
// );

router.get('/profile', authenticateJWT, (req, res) => {
  // req.user is now available thanks to the middleware
  res.json({
    message: 'This is protected data',
    user: req.user!,
  });
});

export default router;
