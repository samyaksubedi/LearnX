import { ApiError, ApiResponse } from '../../utils/api-output.util.js';
import { conversationsService } from './conversations.service.js';

const fromYoutube = async (req, res, next) => {
  try {
    const { sourceLink } = req.body; // youtube video url
    const userId = req.user.id;

    const conversation =
      await conversationsService.createConversationFromYoutube(
        userId,
        sourceLink,
      );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          conversation,
          'Conversation created and started processing in the background !',
        ),
      );
  } catch (error) {
    next(error);
  }
};
const fromUpload = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    if (!file) {
      return res.status(400).json(new ApiError(400, 'File is required !'));
    }
    const conversation = await conversationsService.createConversationFromMedia(
      {
        userId,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
      },
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          conversation,
          'Conversation created and started processing in the background !',
        ),
      );
  } catch (error) {
    next(error);
  }
};
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await conversationsService.getConversations(userId);
    if (conversations.length == 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, 'No conversations found'));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          conversations,
          'Conversations fetched successfully',
        ),
      );
  } catch (error) {
    next(error);
  }
};
const getConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const conversation = await conversationsService.getConversation(
      userId,
      conversationId,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, conversation, 'Conversation fetched successfully'),
      );
  } catch (error) {
    next(error);
  }
};
const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    await conversationsService.deleteConversation(userId, conversationId);
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Conversation deleted successfully'));
  } catch (error) {
    next(error);
  }
};
const getConversationStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const status = await conversationsService.getConversationStatus(
      userId,
      conversationId,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, { status }, 'Status fetched successfully'));
  } catch (error) {
    next(error);
  }
};
const chatWithConversation = async (req, res, next) => {};
const updateConversationTitle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = res.body;
    const { conversationId } = res.params;
    await conversationsService.updateConversationTitle(
      userId,
      conversationId,
      title,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, { title }, 'Title updated successfull !'));
  } catch (error) {
    next(error);
  }
};

export {
  fromYoutube,
  fromUpload,
  getConversations,
  getConversation,
  deleteConversation,
  getConversationStatus,
  chatWithConversation,
};
