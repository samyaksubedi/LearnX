import { envVariables } from '../../configs/env.config.js';

const getAIAnswer = async (query, conversation_id, history) => {
  const response = await fetch(`${envVariables.AI_URL}/api/internal/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      conversation_id,
      history,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status}`);
  }

  return response.json();
};

export { getAIAnswer };
