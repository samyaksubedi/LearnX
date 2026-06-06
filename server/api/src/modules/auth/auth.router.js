import express from 'express';

import {
  signUp,
  resendVerificationToken,
  verifyUser,
  signIn,
  logout, // Clears user session from current device
  logoutFromAllDevices, // Clear users session from all other loggedIn devices
  refresh,
  getAllLoggedInDeviceInfo,
  getMe,
} from './auth.controller.js';

import {
  signUpReqBodySchema,
  signInReqBodySchema,
  resendVerificationTokenReqBodySchema,
} from './auth.validation.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';

const router = express.Router();
router.get('/', (req, res) => {
  res.send('Auth is Authing !!');
});
router.post('/signUp', validate(signUpReqBodySchema), signUp);
router.post(
  '/resend-verification',
  validate(resendVerificationTokenReqBodySchema),
  resendVerificationToken,
);
router.get('/verify/:token', verifyUser);
router.post('/signIn', validate(signInReqBodySchema), signIn);
router.post('/logout', authenticateUser, logout);
router.post('/logout-all', authenticateUser, logoutFromAllDevices);
router.get(
  '/info-loggedIn-devices',
  authenticateUser,
  getAllLoggedInDeviceInfo,
);
router.post('/refresh', refresh);
router.get('/me', authenticateUser, getMe);

export default router;
