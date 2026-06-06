// POST   /api/conversations/from-youtube
// POST   /api/conversations/from-upload

// GET    /api/conversations
// GET    /api/conversations/:conversationId
// GET    /api/conversations/:conversationId/status
// GET    /api/conversations/:conversationId/messages

// POST   /api/conversations/:conversationId/chat

// DELETE /api/conversations/:conversationId

import express from 'express';

import {

} from './webhook.controller.js';

const router = express.Router();

router.post('/update', authenticateUser, fromYoutube);


export default router;
