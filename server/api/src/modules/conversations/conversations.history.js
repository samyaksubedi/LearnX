import { prisma } from '../../db/client.db.js';

const getUsersConversationHistory = async (
  conversationId,
  nnumberOfLastMessages,
) => {
  //  Fetch last N messages from the database for the user of given conversationId
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: nnumberOfLastMessages,
    select: {
      role: true,
      content: true,
    },
  });

  return messages.reverse(); // Reverse to get chronological order
};

export { getUsersConversationHistory };
