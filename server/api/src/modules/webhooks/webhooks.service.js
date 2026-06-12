import { prisma } from '../../db/client.db.js';
import { ApiError } from '../../utils/api-output.util.js';

const updateConversationStatus = async (
  status,
  title,
  conversationId,
  errorMessage,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) {
    throw new ApiError(400, 'Conversation not found');
  }
  if (errorMessage) {
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        status,
        errorMessage,
      },
    });
  } else {
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        title,
        status,
      },
    });
  }
};

export const webHookServices = { updateConversationStatus };
