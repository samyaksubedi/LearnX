import { envVariables } from '../../configs/env.config.js';
import { ApiError, ApiResponse } from '../../utils/api-output.util.js';
import { webHookServices } from './webhooks.service.js';

const updateConversationStatus = async (req, res, next) => {
  try {
    // Verification so ,not anyone can updateStatus other that our microservice
    if (req.headers['x-webhook-secret'] !== envVariables.WEBHOOK_SECRET) {
      return res.status(401).json(new ApiError(401, 'Unauthorized'));
    }
    // enum status =    ready | failed
    const { status, title, conversationId, errorMessage } = req.body;
    await webHookServices.updateConversationStatus(
      status,
      title,
      conversationId,
      errorMessage,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Status updated successfully'));
  } catch (error) {
    next(error);
  }
};

export { updateConversationStatus };
