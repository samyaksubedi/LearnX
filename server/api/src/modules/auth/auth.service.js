// import { logger } from '../../Configs/logger.config.js';
import { prisma } from '../../db/client.db.js';
import { ApiError } from '../../utils/api-output.util.js';
import { hashPassword } from './auth.crypto.js';
import { sendWelcomeEmail } from './auth.email.js';
import { generateEmailVerificationToken } from './auth.tokens.js';

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

export const authService = { signUp };
