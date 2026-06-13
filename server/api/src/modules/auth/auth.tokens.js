import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { envVariables } from '../../configs/env.config.js';

const generateEmailVerificationToken = () => {
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationTokenExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );
  return { emailVerificationToken, emailVerificationTokenExpires };
};
const generateAccessToken = (userId, email, sessionId) => {
  return jwt.sign(
    { id: userId, email: email, sessionId: sessionId }, // payload
    envVariables.ACCESS_TOKEN_SECRET, // secret key
    { expiresIn: '15m' }, // short expiry
  );
};
const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return { refreshToken, refreshTokenExpires };
};

export {
  generateEmailVerificationToken,
  generateAccessToken,
  generateRefreshToken,
};
