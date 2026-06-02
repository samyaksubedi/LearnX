import express from 'express';

import {
  signUp,
  resendVerificationToken,
  verifyUser,
  signIn,
  logout, // Clears user session from current device
  logoutFromAllDevices, // Clear users session from all other loggedIn devices
  refresh,
} from './auth.controller.js';
// import { validate } from '../Middlewares/validate.middleware.js';
import {
  signUpReqBodySchema,
  signInReqBodySchema,
  resendVerificationTokenReqBodySchema,
} from '../Schemas/auth.schema.js';

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
router.post('/logout', logoutUser);
router.post('/logout-all', logoutFromAllDevices);
router.post('/refresh', refresh);


export default router;
