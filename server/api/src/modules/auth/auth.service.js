import { prisma } from '../../db/client.db.js';
import { ApiError } from '../../utils/api-output.util.js';
import {
  comparePassword,
  hashPassword,
  hashRefreshToken,
  compareRefreshToken,
} from './auth.crypto.js';
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
  const refreshTokenHash = await hashRefreshToken(refreshToken);

  // 4. Create user session for every new login (Can support multi device login ) ;
  const userSession = await prisma.userSession.create({
    data: {
      refreshTokenHash,
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
export const authService = {
  signUp,
  verifyUser,
  resendVerificationToken,
  signIn,
};
