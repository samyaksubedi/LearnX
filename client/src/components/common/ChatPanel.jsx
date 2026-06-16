import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, Loader2, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chatWithConversation } from '@/api/conversations.api';

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const ChatPanel = ({ conversation, status, onCitation }) => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState(conversation.messages || []);
  const bottomRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync messages when conversation updates
  useEffect(() => {
    setMessages(conversation.messages || []);
  }, [conversation.messages]);

  const chatMutation = useMutation({
    mutationFn: (query) => chatWithConversation(conversation.id, query),
    onMutate: (query) => {
      // Optimistically add user message
      const userMsg = {
        id: `temp-${Date.now()}`,
        role: 'User',
        content: query,
        sourceRefrence: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
    },
    onSuccess: (response) => {
      const { content, sourceReference } = response.data.chatResponse;
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'Assistant',
        content,
        sourceRefrence: sourceReference,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Auto-jump to citation
      if (sourceReference) {
        onCitation(sourceReference);
      }

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => !m.id?.startsWith('temp-')));
      if (error.response?.status === 429) {
        toast.error('Daily limit reached. Try again tomorrow.');
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong');
      }
    },
  });

  const handleSend = () => {
    if (!query.trim() || chatMutation.isPending) return;
    const q = query.trim();
    setQuery('');
    chatMutation.mutate(q);
  };

  const isDisabled = status !== 'ready' || chatMutation.isPending;

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-border shrink-0'>
        <h2 className='font-semibold text-foreground truncate'>
          {conversation.title || 'Untitled'}
        </h2>
        <p className='text-xs text-muted-foreground capitalize'>
          {conversation.sourceType} • {status}
        </p>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 && status === 'ready' && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground text-sm'>
              Ask anything about your content!
            </p>
          </div>
        )}

        {status === 'processing' && (
          <div className='text-center py-12 space-y-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground mx-auto' />
            <p className='text-muted-foreground text-sm'>
              Processing your media, please wait...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className='text-center py-12'>
            <p className='text-destructive text-sm'>
              Processing failed. Cannot chat with this conversation.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.role === 'User' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`
                max-w-[85%] rounded-2xl px-4 py-3 text-sm
                ${
                  msg.role === 'User'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }
              `}
            >
              <p className='whitespace-pre-wrap'>{msg.content}</p>
            </div>

            {/* Citation badge */}
            {msg.role === 'Assistant' && msg.sourceRefrence && (
              <button
                onClick={() => onCitation(msg.sourceRefrence)}
                className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-accent'
              >
                {msg.sourceRefrence.pageNumber ? (
                  <>
                    <FileText className='h-3 w-3' />
                    Page {msg.sourceRefrence.pageNumber}
                  </>
                ) : (
                  <>
                    <Clock className='h-3 w-3' />
                    Jump to {formatTime(msg.sourceRefrence.start)} -{' '}
                    {formatTime(msg.sourceRefrence.end)}
                  </>
                )}
              </button>
            )}
          </div>
        ))}

        {/* AI thinking indicator */}
        {chatMutation.isPending && (
          <div className='flex items-start'>
            <div className='bg-muted rounded-2xl rounded-bl-sm px-4 py-3'>
              <div className='flex gap-1 items-center'>
                <div className='h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]' />
                <div className='h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]' />
                <div className='h-2 w-2 bg-muted-foreground rounded-full animate-bounce' />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className='p-4 border-t border-border shrink-0'>
        {status === 'ready' ? (
          <div className='flex gap-2'>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder='Ask anything about your content...'
              disabled={isDisabled}
              rows={1}
              className='flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 min-h-[48px] max-h-32'
            />
            <Button
              size='icon'
              onClick={handleSend}
              disabled={isDisabled || !query.trim()}
              className='h-12 w-12 shrink-0 rounded-xl'
            >
              {chatMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </Button>
          </div>
        ) : (
          <div className='flex items-center justify-center py-3 text-sm text-muted-foreground'>
            {status === 'processing' ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                Waiting for processing to complete...
              </>
            ) : (
              'Chat unavailable — processing failed'
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
