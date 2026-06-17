import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useConversation,
  useConversationStatus,
} from '@/hooks/useConversation';
import MediaViewer from '@/components/common/MediaViewer';
import ChatPanel from '@/components/common/ChatPanel';
import { Loader2 } from 'lucide-react';

const ConversationPage = () => {
  const { conversationId } = useParams();
  const queryClient = useQueryClient();
  const [citationRef, setCitationRef] = useState(null);

  const { data: conversation, isLoading } = useConversation(conversationId);

  const { data: polledStatus } = useConversationStatus(
    conversationId,
    conversation?.status,
  );

  useEffect(() => {
    if (polledStatus === 'ready' && conversation?.status === 'processing') {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [polledStatus]);

  const handleCitation = (sourceRef) => {
    setCitationRef({ ...sourceRef, _t: Date.now() });
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full bg-background'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='flex items-center justify-center h-full bg-background'>
        <p className='text-muted-foreground'>Conversation not found</p>
      </div>
    );
  }

  const currentStatus = polledStatus || conversation.status;

  return (
    <div className='flex h-full overflow-hidden bg-background'>
      {/* Media Viewer — takes up remaining space */}
      <div className='flex-1 overflow-hidden bg-[#0a0a0a]'>
        <MediaViewer
          conversation={conversation}
          status={currentStatus}
          citationRef={citationRef}
        />
      </div>

      {/* Subtle divider — just a shadow, no harsh border */}
      <div className='w-px bg-gradient-to-b from-transparent via-border to-transparent shrink-0' />

      {/* Chat Panel */}
      <div className='w-[400px] shrink-0 flex flex-col overflow-hidden bg-background'>
        <ChatPanel
          conversation={conversation}
          status={currentStatus}
          onCitation={handleCitation}
        />
      </div>
    </div>
  );
};

export default ConversationPage;
