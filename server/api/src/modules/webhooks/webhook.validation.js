import { z } from 'zod';

const updateConversationStatusBodySchema = z.object({
  status: z.enum(['ready', 'failed']),
  // title: z.string().optional(), // No title if processing failed
  conversationId: z.string().uuid(),
  errorMessage: z.string().optional(),
});

export { updateConversationStatusBodySchema };
