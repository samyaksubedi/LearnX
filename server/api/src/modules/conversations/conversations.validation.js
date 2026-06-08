import { z } from 'zod';

const convoIdParams = z.object({
  conversationId: z.string().uuid(),
});

const chatReqBody = z.object({
  query: z.string(),
});
export { convoIdParams, chatReqBody };
