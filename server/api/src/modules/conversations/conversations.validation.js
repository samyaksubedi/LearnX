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

const updateConvoTitleReqBody = z.object({
  title: z.string(),
});

export {
  convoIdParams,
  chatReqBody,
  createConvoFromYoutubeReqBody,
  updateConvoTitleReqBody,
};
