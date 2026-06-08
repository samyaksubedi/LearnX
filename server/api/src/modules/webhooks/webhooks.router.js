import express from 'express';

import { updateConversationStatus } from './webhooks.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateConversationStatusBodySchema } from './webhook.validation.js';

const router = express.Router();

router.post(
  '/conversation-status',
  validate(updateConversationStatusBodySchema),
  updateConversationStatus,
);

export default router;
