import { id } from 'zod/v4/locales';
import { prisma } from '../../db/client.db.js';
import { ApiError } from '../../utils/api-output.util.js';
import { comparePassword, hashPassword } from './auth.crypto.js';
import { resendVerificationEmail, sendWelcomeEmail } from './auth.email.js';
import {
  generateAccessToken,
  generateEmailVerificationToken,
  generateRefreshToken,
} from './auth.tokens.js';

const signUp = async ({ name, email, password }) => {
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new ApiError(400, 'User already exists with this email');
  }
  const passwordHash = await hashPassword(password);
  const { emailVerificationToken, emailVerificationTokenExpires } =
    generateEmailVerificationToken();

  const user = prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      emailVerificationToken,
      emailVerificationTokenExpires,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
    },
  });
  await sendWelcomeEmail({
    to: email,
    name: name,
    emailVerificationToken: emailVerificationToken,
  });

  return user;
};

const verifyUser = async (emailVerificationToken) => {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: emailVerificationToken,
      emailVerificationTokenExpires: { gt: new Date() },
    },
  });
  if (!user) {
    throw new ApiError(400, 'Verification link expired or invalid');
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    },
  });
};

const resendVerificationToken = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, 'User not found with the email');
  }
  if (user.isVerified) {
    throw new ApiError(400, 'User is already Verified');
  }
  const { emailVerificationToken, emailVerificationTokenExpires } =
    generateEmailVerificationToken();
  await prisma.user.update({
    where: { email },
    data: {
      emailVerificationToken,
      emailVerificationTokenExpires,
    },
  });
  await resendVerificationEmail({
    name: user.name,
    to: email,
    emailVerificationToken: emailVerificationToken,
  });
};

const signIn = async (email, password, deviceInfo, ipAddress) => {
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // 2. Check if verified
  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email first');
  }

  // 3. Compare password
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // 4. Generate refresh token ;
  const { refreshToken, refreshTokenExpires } = generateRefreshToken();

  // 4. Create user session for every new login (Can support multi device login ) ;
  const userSession = await prisma.userSession.create({
    data: {
      refreshToken,
      refreshTokenExpires,
      userId: user.id,
      ipAddress,
      deviceInfo,
    },
  });

  // 5. GenerateAccessToken

  const accessToken = generateAccessToken(user.id, user.email, userSession.id);

  // 6. Return related data to the controller so it can send a proper response back to the user  : )

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
    refreshTokenExpires,
  };
};

const logout = async (sessionId) => {
  await prisma.userSession.delete({
    where: {
      id: sessionId,
    },
  });
};
const logoutFromAllDevices = async (userId) => {
  const playload = await prisma.userSession.deleteMany({
    where: {
      userId,
    },
  });
  return playload.count;
};

const refresh = async (refreshToken) => {
  const userSession = await prisma.userSession.findFirst({
    where: {
      refreshToken,
      refreshTokenExpires: { gt: new Date() },
    },
  });
  if (!userSession) {
    throw new ApiError(
      400,
      'Invalid or Expired refreshToken, Please login again!',
    );
  }
  const userId = userSession.userId;
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  // Logs
  await prisma.userSession.update({
    where: {
      id: userSession.id,
    },
    data: { lastUsedAt: new Date() },
  });
  const accessToken = generateAccessToken(userId, user.email, userSession.id);
  return accessToken;
};

const getAllLoggedInDeviceInfo = async (userId) => {
  const deviceInfo = await prisma.userSession.findMany({
    where: {
      userId,
    },
    select: {
      deviceInfo: true,
      ipAddress: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });
  return deviceInfo;
};

const getMe = async (userId) => {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isVerified: true,
      name: true,
    },
  });

  return user;
};

export const authService = {
  signUp,
  verifyUser,
  resendVerificationToken,
  signIn,
  logout,
  logoutFromAllDevices,
  getAllLoggedInDeviceInfo,
  refresh,
  getMe,
};
