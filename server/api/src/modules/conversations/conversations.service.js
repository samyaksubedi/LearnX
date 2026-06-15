import { prisma } from '../../db/client.db.js';
import { ApiError } from '../../utils/api-output.util.js';
import { validateYoutubeUrl } from './conversations.youtube.js';
import { deleteSourceFile, uploadSourceFile } from './conversations.upload.js';
import { logger } from '../../configs/logger.config.js';
import { enqueueConversationJob } from '../../services/queue.service.js';
import { getUsersConversationHistory } from './conversations.history.js';
import { getAIAnswer } from './conversations.ai.js';

const createConversationFromYoutube = async (userId, sourceLink) => {
  // Validate the url
  // Create conversation with status processing
  // Push to the queue - {convoId , sourceLink}
  // return the conversation
  const metadata = await validateYoutubeUrl(sourceLink);
  if (!metadata.isValid) {
    const errorMessage = metadata.errorMessage;
    throw new ApiError(400, errorMessage);
  }
  const youtubeVideoTitle = metadata.title;
  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: youtubeVideoTitle, // Default Title
      sourceLink,
      sourceType: 'youtube',
      status: 'processing',
    },
    select: {
      id: true,
      title: true,
      sourceLink: true,
      sourceType: true,
      status: true,
    },
  });

  //TODO Publish to queue
  await enqueueConversationJob({
    conversationId: conversation.id,
    youtubeUrl: conversation.sourceLink,
    type: conversation.sourceType,
  });
  return conversation;
};
const createConversationFromMedia = async ({
  userId,
  filePath,
  fileSize,
  mimeType,
  originalName,
}) => {
  const mimeToSourceType = (mimeType) => {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';

    throw new ApiError(400, 'Unsupported file type');
  };

  const sourceType = mimeToSourceType(mimeType);

  const { publicId, secureUrl } = await uploadSourceFile(
    filePath,
    sourceType,
    fileSize,
  );
  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: originalName || 'Untitled Media',
      sourceLink: secureUrl,
      sourcePublicId: publicId,
      sourceType,
      status: 'processing',
    },
    select: {
      id: true,
      title: true,
      sourceLink: true,
      sourceType: true,
      status: true,
    },
  });

  // TODO: publish to queue
  await enqueueConversationJob({
    conversationId: conversation.id,
    filePath: filePath,
    type: conversation.sourceType,
  });

  return conversation;
};
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
  // Delete uploaded Media related to the conversation from cloudinary
  await deleteSourceFile(conversation.sourcePublicId, conversation.sourceType);

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
      userId: true,
    },
  });
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }
  // Prevent user from seeing another user's conversation status
  if (conversation.userId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }
  return conversation.status;
};
const chatWithConversation = async (userId, conversationId, query) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      status: true,
      userId: true,
    },
  });
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }
  // Prevent user from chatting in another user's conversation
  if (conversation.userId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }
  if (conversation.status !== 'ready') {
    throw new ApiError(
      400,
      'Sorry Conversation is being processed or eventually ! Cant chat right now ',
    );
  }
  // Create seperate message for user Query : )
  await prisma.message.create({
    data: {
      conversationId,
      role: 'User',
      content: query,
    },
  });
  const chatHistory = await getUsersConversationHistory(conversationId, 10);
  const result = await getAIAnswer(query, conversationId, chatHistory);
  const content = result.response;
  const sourceReference = result.source_reference;
  //  If pdf :  {pageNumber} else {start,end}
  // Create seperate message for AI response
  await prisma.message.create({
    data: {
      conversationId,
      role: 'Assistant',
      content,
      sourceReference,
    },
  });
  return { content, sourceReference };
};

const updateConversationTitle = async (userId, conversationId, title) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      userId: true,
    },
  });
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }
  // Prevent user from updating another user's conversation title
  if (conversation.userId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }
  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      title,
    },
  });
};

export const conversationsService = {
  createConversationFromYoutube,
  createConversationFromMedia,
  getConversations,
  getConversation,
  deleteConversation,
  getConversationStatus,
  chatWithConversation,
  updateConversationTitle,
};
