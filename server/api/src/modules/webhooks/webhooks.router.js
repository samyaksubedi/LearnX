import express from 'express';

import { updateConversationStatus } from './webhooks.controller.js';

const router = express.Router();

router.post('/conversation-status', updateConversationStatus);

export default router;
