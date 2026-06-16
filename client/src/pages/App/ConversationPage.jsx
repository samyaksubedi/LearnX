import { useState, useEffect, useRef } from 'react';
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
  // citationRef: { start, end } for media OR { pageNumber } for PDF OR null

  const { data: conversation, isLoading } = useConversation(conversationId);

  // Poll status while processing
  const { data: polledStatus } = useConversationStatus(
    conversationId,
    conversation?.status,
  );

  // When status changes to ready → refresh conversation
  useEffect(() => {
    if (polledStatus === 'ready' && conversation?.status === 'processing') {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [polledStatus]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>Conversation not found</p>
      </div>
    );
  }

  const currentStatus = polledStatus || conversation.status;

  return (
    <div className='flex h-full overflow-hidden'>
      {/* Media Viewer — center */}
      <div className='flex-1 border-r border-border overflow-hidden'>
        <MediaViewer
          conversation={conversation}
          status={currentStatus}
          citationRef={citationRef}
        />
      </div>

      {/* Chat Panel — right */}
      <div className='w-[420px] shrink-0 flex flex-col overflow-hidden'>
        <ChatPanel
          conversation={conversation}
          status={currentStatus}
          onCitation={setCitationRef}
        />
      </div>
    </div>
  );
};

export default ConversationPage;
