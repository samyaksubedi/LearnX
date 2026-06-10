// POST   /api/conversations/from-youtube
// POST   /api/conversations/from-upload

// GET    /api/conversations
// GET    /api/conversations/:conversationId
// GET    /api/conversations/:conversationId/status
// GET    /api/conversations/:conversationId/messages

// POST   /api/conversations/:conversationId/chat

// DELETE /api/conversations/:conversationId

import express from 'express';
import { authenticateUser } from '../../middlewares/auth.middleware.js';
import {
  chatWithConversation,
  deleteConversation,
  fromUpload,
  fromYoutube,
  getConversation,
  getConversations,
  getConversationStatus,
} from './conversations.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  chatReqBody,
  convoIdParams,
  createConvoFromYoutubeReqBody,
  updateConvoTitleReqBody,
} from './conversations.validation.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.post(
  '/from-youtube',
  authenticateUser,
  validate(createConvoFromYoutubeReqBody),
  fromYoutube,
);
router.post(
  '/from-upload',
  authenticateUser,
  upload.single('file'),
  fromUpload,
);
router.post(
  '/:conversationId/update-title',
  validate(convoIdParams, 'params'),
  validate(updateConvoTitleReqBody),
  chatWithConversation,
);
router.get('/', authenticateUser, getConversations);
router.get(
  '/:conversationId',
  authenticateUser,
  validate(convoIdParams, 'params'),
  getConversation,
);
router.get(
  '/:conversationId/status',
  authenticateUser,
  validate(convoIdParams, 'params'),
  getConversationStatus,
);
router.delete(
  '/:conversationId',
  authenticateUser,
  validate(convoIdParams, 'params'),
  deleteConversation,
);
router.post(
  '/:conversationId/chat',
  validate(convoIdParams, 'params'),
  validate(chatReqBody),
  chatWithConversation,
);

export default router;
