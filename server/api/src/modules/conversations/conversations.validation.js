import { z } from 'zod';

const convoIdParams = z.object({
  conversationId: z.string().uuid(),
});

const chatReqBody = z.object({
  query: z.string(),
});
const createConvoFromYoutubeReqBody = z.object({
  sourceLink: z.url(),
});
export { convoIdParams, chatReqBody, createConvoFromYoutubeReqBody };
