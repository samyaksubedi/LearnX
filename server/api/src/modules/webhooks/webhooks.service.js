import { prisma } from '../../db/client.db.js';

const updateConversationStatus = async (
  status,
  title,
  conversationId,
  errorMessage,
) => {
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
