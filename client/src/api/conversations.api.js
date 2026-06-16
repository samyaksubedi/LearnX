import api from '@/lib/axios';

export const getConversations = async () => {
  const response = await api.get('/api/conversations');
  return response.data;
};

export const getConversation = async (conversationId) => {
  const response = await api.get(`/api/conversations/${conversationId}`);
  return response.data;
};

export const getConversationStatus = async (conversationId) => {
  const response = await api.get(`/api/conversations/${conversationId}/status`);
  return response.data;
};

export const createConversationFromYoutube = async (sourceLink) => {
  const response = await api.post('/api/conversations/from-youtube', {
    sourceLink,
  });
  return response.data;
};

export const createConversationFromUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/conversations/from-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/api/conversations/${conversationId}`);
  return response.data;
};

export const updateConversationTitle = async (conversationId, title) => {
  const response = await api.post(
    `/api/conversations/${conversationId}/update-title`,
    { title },
  );
  return response.data;
};

export const chatWithConversation = async (conversationId, query) => {
  const response = await api.post(`/api/conversations/${conversationId}/chat`, {
    query,
  });
  return response.data;
};
