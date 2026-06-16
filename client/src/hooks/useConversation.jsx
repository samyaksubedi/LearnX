import { useQuery } from '@tanstack/react-query';
import {
  getConversation,
  getConversationStatus,
} from '@/api/conversations.api';

export const useConversation = (conversationId) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const res = await getConversation(conversationId);
      return res.data;
    },
    enabled: !!conversationId,
  });
};

export const useConversationStatus = (conversationId, currentStatus) => {
  return useQuery({
    queryKey: ['conversation-status', conversationId],
    queryFn: async () => {
      const res = await getConversationStatus(conversationId);
      return res.data.status;
    },
    enabled: !!conversationId && currentStatus === 'processing',
    refetchInterval: (query) => {
      const status = query.state.data;
      if (status === 'processing') return 4000;
      return false;
    },
  });
};
