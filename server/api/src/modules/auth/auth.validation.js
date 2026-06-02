import { z } from 'zod';

const signUpReqBodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});
const signInReqBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const resendVerificationTokenReqBodySchema = z.object({
  email: z.string().email(),
});

export {
  signUpReqBodySchema,
  signInReqBodySchema,
  resendVerificationTokenReqBodySchema,
};
