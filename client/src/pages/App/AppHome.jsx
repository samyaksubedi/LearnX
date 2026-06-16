import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppHome = () => {
  return (
    <div className='flex items-center justify-center h-full'>
      <div className='text-center space-y-4'>
        <div className='bg-muted rounded-full p-6 inline-flex'>
          <Plus className='h-12 w-12 text-muted-foreground' />
        </div>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold text-foreground'>
            Start a new conversation
          </h2>
          <p className='text-muted-foreground max-w-sm'>
            Upload a video, audio, PDF or paste a YouTube link to get started.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppHome;
