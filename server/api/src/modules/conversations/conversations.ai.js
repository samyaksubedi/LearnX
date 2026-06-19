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
const deleteQdrantChunks = async (conversationId) => {
  const response = await fetch(
    `${envVariables.AI_URL}/api/internal/chat/delete`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status}`);
  }

  return response.json();
};

const validateYoutubeUrl = async (sourceLink) => {
  try {
    const response = await fetch(
      `${envVariables.AI_URL}/api/internal/chat/youtube-metadata`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtube_url: sourceLink,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Invalid YouTube URL');
    }

    const data = await response.json();
    console.log(data);

    return {
      isValid: true,
      title: data,
    };
  } catch (error) {
    console.log(error);
    return {
      isValid: false,
      errorMessage: 'Invalid, private, or unavailable YouTube video',
    };
  }
};
export { getAIAnswer, deleteQdrantChunks, validateYoutubeUrl };
