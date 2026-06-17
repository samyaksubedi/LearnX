import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Play,
  FileVideo,
  FileAudio,
  FileText,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  LogOut,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  getConversations,
  deleteConversation,
  updateConversationTitle,
} from '@/api/conversations.api';
import { logout } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import NewConversationModal from './NewConversationModal';

const sourceTypeIcon = (type) => {
  const props = { className: 'h-4 w-4 shrink-0' };
  if (type === 'youtube') return <Play {...props} />;
  if (type === 'video') return <FileVideo {...props} />;
  if (type === 'audio') return <FileAudio {...props} />;
  if (type === 'pdf') return <FileText {...props} />;
  return null;
};
const statusColor = (status) => {
  if (status === 'ready')
    return 'bg-green-500/15 text-green-600 border-green-500/20';
  if (status === 'processing')
    return 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20';
  if (status === 'failed')
    return 'bg-red-500/15 text-red-600 border-red-500/20';
  return '';
};

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();

  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Fetch conversations
  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await getConversations();
      return res.data;
    },
  });

  const conversations = data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      toast.success('Conversation deleted');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (conversationId === deleteId) navigate('/app');
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete');
      setDeleteId(null);
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, title }) => updateConversationTitle(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setEditingId(null);
    },
    onError: () => {
      toast.error('Failed to rename');
      setEditingId(null);
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      window.location.href = '/';
    },
    onError: () => {
      clearAuth();
      window.location.href = '/';
    },
  });
  const handleRenameStart = (convo) => {
    setEditingId(convo.id);
    setEditTitle(convo.title || 'Untitled');
  };

  const handleRenameSubmit = (id) => {
    if (!editTitle.trim()) return;
    renameMutation.mutate({ id, title: editTitle.trim() });
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          flex flex-col h-full border-r border-border bg-sidebar transition-all duration-300
          ${isOpen ? 'w-72' : 'w-14'}
        `}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-3 border-b border-border h-14 shrink-0'>
          {isOpen && (
            <Link to='/app' className='font-bold text-lg text-foreground'>
              LearnX
            </Link>
          )}
          <Button
            variant='ghost'
            size='icon'
            onClick={onToggle}
            className='shrink-0'
          >
            {isOpen ? (
              <PanelLeftClose className='h-5 w-5' />
            ) : (
              <PanelLeftOpen className='h-5 w-5' />
            )}
          </Button>
        </div>

        {/* New Conversation Button */}
        <div className='p-2 shrink-0'>
          <Button
            className='w-full'
            size={isOpen ? 'default' : 'icon'}
            onClick={() => setNewConvoOpen(true)}
          >
            <Plus className='h-4 w-4' />
            {isOpen && <span className='ml-2'>New Conversation</span>}
          </Button>
        </div>

        {/* Conversation List */}
        <div className='flex-1 overflow-y-auto p-2 space-y-1'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : conversations.length === 0 ? (
            isOpen && (
              <p className='text-xs text-muted-foreground text-center py-8 px-2'>
                No conversations yet. Create one!
              </p>
            )
          ) : (
            conversations.map((convo) => (
              <div
                key={convo.id}
                className={`
                  group relative flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer
                  hover:bg-accent transition-colors
                  ${conversationId === convo.id ? 'bg-accent' : ''}
                `}
                onClick={() => navigate(`/app/conversations/${convo.id}`)}
              >
                {/* Icon */}
                <span className='text-muted-foreground shrink-0'>
                  {sourceTypeIcon(convo.sourceType)}
                </span>

                {isOpen && (
                  <>
                    {/* Title / Edit */}
                    <div className='flex-1 min-w-0'>
                      {editingId === convo.id ? (
                        <div
                          className='flex items-center gap-1'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className='h-6 text-xs px-1'
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter')
                                handleRenameSubmit(convo.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-5 w-5 shrink-0'
                            onClick={() => handleRenameSubmit(convo.id)}
                          >
                            <Check className='h-3 w-3' />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-5 w-5 shrink-0'
                            onClick={() => setEditingId(null)}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      ) : (
                        <p className='text-sm truncate text-foreground'>
                          {convo.title || 'Untitled'}
                        </p>
                      )}
                    </div>

                    {/* Status + Actions */}
                    {editingId !== convo.id && (
                      <div
                        className='flex items-center gap-1 shrink-0'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${statusColor(convo.status)}`}
                        >
                          {convo.status}
                        </span>
                        {/* Actions - show on hover */}
                        <div className='hidden group-hover:flex items-center gap-0.5'>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-6 w-6'
                            onClick={() => handleRenameStart(convo)}
                          >
                            <Pencil className='h-3 w-3' />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-6 w-6 text-destructive hover:text-destructive'
                            onClick={() => setDeleteId(convo.id)}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer — User */}
        <div className='p-2 border-t border-border shrink-0'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className={`w-full ${isOpen ? 'justify-start gap-2 px-2' : 'justify-center px-0'}`}
              >
                <Avatar className='h-7 w-7 shrink-0'>
                  <AvatarFallback className='text-xs'>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isOpen && (
                  <div className='flex flex-col items-start min-w-0'>
                    <span className='text-sm font-medium truncate'>
                      {user?.name}
                    </span>
                    <span className='text-xs text-muted-foreground truncate'>
                      {user?.email}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                <Settings className='h-4 w-4 mr-2' />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive'
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className='h-4 w-4 mr-2' />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              This will permanently delete this conversation and all its
              messages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Conversation Modal */}
      <NewConversationModal
        open={newConvoOpen}
        onClose={() => setNewConvoOpen(false)}
      />
    </>
  );
};

export default Sidebar;
