import { prisma } from '../../db/client.db.js';
import { ApiError } from '../../utils/api-output.util.js';

const fromYoutube = async () => {};
const fromUpload = async () => {};
const getConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }, // latest active conversation first
    select: {
      id: true,
      title: true,
      sourceType: true,
      status: true,
      updatedAt: true,
    },
  });
  return conversations;
};
const getConversation = async (userId, conversationId) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }, // oldest first
      },
    },
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Prevent user from accessing another user's conversation
  if (conversation.userId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }
  //TODO   select: {
  //   id: true,
  //   title: true,
  //   messages: {
  //     select: {
  //       role: true,
  //       content: true,
  //       sourceReference: true,
  //     },
  //   },
  // }
  return conversation;
};
const deleteConversation = async (userId, conversationId) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Prevent user from deleting another user's conversation
  if (conversation.userId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }

  // Delete conversation — cascade deletes all messages automatically
  await prisma.conversation.delete({
    where: { id: conversationId },
  });
};
const getConversationStatus = async (userId, conversationId) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      status: true,
    },
  });
  // Prevent user from seeing another user's conversation status
  if (conversation.userId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }
  return conversation.status;
};
const chatWithConversation = async () => {};

export const conversationsService = {
  fromYoutube,
  fromUpload,
  getConversations,
  getConversation,
  deleteConversation,
  getConversationStatus,
  chatWithConversation,
};
