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
 
const router = express.Router();

router.post('/from-youtube', authenticateUser, fromYoutube);
router.post('/from-upload', authenticateUser, fromUpload);
router.get('/', authenticateUser, getConversations);
router.get('/:conversationId', authenticateUser, getConversation);
router.get('/:conversationId/status', authenticateUser, getConversationStatus);
router.delete('/:conversationId', authenticateUser, deleteConversation);
router.post('/:conversationId/chat', chatWithConversation);

export default router;
