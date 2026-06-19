// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { toast } from 'sonner'
// import { Loader2, Play, FileVideo, FileAudio, FileText, Link, Upload } from 'lucide-react'
// import { useQueryClient } from '@tanstack/react-query'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   createConversationFromYoutube,
//   createConversationFromUpload,
// } from '@/api/conversations.api'

// const TYPES = [
//   {
//     id: 'youtube',
//     label: 'YouTube',
//     description: 'Paste a YouTube video URL',
//     icon: Play,
//     accept: null,
//   },
//   {
//     id: 'video',
//     label: 'Video',
//     description: 'Upload an MP4, MOV or AVI file',
//     icon: FileVideo,
//     accept: 'video/*',
//   },
//   {
//     id: 'audio',
//     label: 'Audio',
//     description: 'Upload an MP3, WAV or M4A file',
//     icon: FileAudio,
//     accept: 'audio/*',
//   },
//   {
//     id: 'pdf',
//     label: 'PDF',
//     description: 'Upload a PDF document',
//     icon: FileText,
//     accept: 'application/pdf',
//   },
// ]

// const NewConversationModal = ({ open, onClose }) => {
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()
//   const [step, setStep] = useState(1) // 1 = choose type, 2 = input
//   const [selectedType, setSelectedType] = useState(null)
//   const [youtubeUrl, setYoutubeUrl] = useState('')
//   const [file, setFile] = useState(null)
//   const [isDragging, setIsDragging] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)

//   const handleClose = () => {
//     setStep(1)
//     setSelectedType(null)
//     setYoutubeUrl('')
//     setFile(null)
//     setIsDragging(false)
//     onClose()
//   }

//   const handleTypeSelect = (type) => {
//     setSelectedType(type)
//     setStep(2)
//   }

//   const handleDrop = (e) => {
//     e.preventDefault()
//     setIsDragging(false)
//     const dropped = e.dataTransfer.files[0]
//     if (dropped) setFile(dropped)
//   }

//   const handleSubmit = async () => {
//     if (selectedType.id === 'youtube') {
//       if (!youtubeUrl.trim()) {
//         toast.error('Please enter a YouTube URL')
//         return
//       }
//     } else {
//       if (!file) {
//         toast.error('Please select a file')
//         return
//       }
//     }

//     setIsLoading(true)
//     try {
//       let conversation
//       if (selectedType.id === 'youtube') {
//         const res = await createConversationFromYoutube(youtubeUrl.trim())
//         conversation = res.data
//       } else {
//         const res = await createConversationFromUpload(file)
//         conversation = res.data
//       }
//       toast.success('Conversation created! Processing in background...')
//       queryClient.invalidateQueries({ queryKey: ['conversations'] })
//       handleClose()
//       navigate(`/app/conversations/${conversation.id}`)
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Something went wrong')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-lg">
//         <DialogHeader>
//           <DialogTitle>
//             {step === 1 ? 'New Conversation' : `${selectedType?.label} Conversation`}
//           </DialogTitle>
//           <DialogDescription>
//             {step === 1
//               ? 'Choose the type of content you want to chat with'
//               : selectedType?.description}
//           </DialogDescription>
//         </DialogHeader>

//         {/* Step 1 — Choose Type */}
//         {step === 1 && (
//           <div className="grid grid-cols-2 gap-3 py-2">
//             {TYPES.map((type) => {
//               const Icon = type.icon
//               return (
//                 <button
//                   key={type.id}
//                   onClick={() => handleTypeSelect(type)}
//                   className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border hover:border-primary hover:bg-accent transition-all cursor-pointer text-center"
//                 >
//                   <div className="bg-muted rounded-full p-3">
//                     <Icon className="h-6 w-6 text-foreground" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-foreground">{type.label}</p>
//                     <p className="text-xs text-muted-foreground mt-0.5">
//                       {type.description}
//                     </p>
//                   </div>
//                 </button>
//               )
//             })}
//           </div>
//         )}

//         {/* Step 2 — Input */}
//         {step === 2 && (
//           <div className="space-y-4 py-2">
//             {selectedType?.id === 'youtube' ? (
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">
//                   YouTube URL
//                 </label>
//                 <div className="flex gap-2">
//                   <Link className="h-4 w-4 text-muted-foreground mt-3 shrink-0" />
//                   <Input
//                     placeholder="https://www.youtube.com/watch?v=..."
//                     value={youtubeUrl}
//                     onChange={(e) => setYoutubeUrl(e.target.value)}
//                     disabled={isLoading}
//                     onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div
//                 className={`
//                   border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
//                   ${isDragging ? 'border-primary bg-accent' : 'border-border hover:border-primary hover:bg-accent/50'}
//                 `}
//                 onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
//                 onDragLeave={() => setIsDragging(false)}
//                 onDrop={handleDrop}
//                 onClick={() => document.getElementById('file-upload').click()}
//               >
//                 <input
//                   id="file-upload"
//                   type="file"
//                   className="hidden"
//                   accept={selectedType?.accept}
//                   onChange={(e) => setFile(e.target.files[0])}
//                 />
//                 <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
//                 {file ? (
//                   <div>
//                     <p className="font-medium text-foreground">{file.name}</p>
//                     <p className="text-xs text-muted-foreground mt-1">
//                       {(file.size / 1024 / 1024).toFixed(2)} MB
//                     </p>
//                   </div>
//                 ) : (
//                   <div>
//                     <p className="font-medium text-foreground">
//                       Drop your file here or click to browse
//                     </p>
//                     <p className="text-xs text-muted-foreground mt-1">
//                       {selectedType?.accept}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Actions */}
//             <div className="flex gap-2 pt-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setStep(1)}
//                 disabled={isLoading}
//                 className="flex-1"
//               >
//                 Back
//               </Button>
//               <Button
//                 onClick={handleSubmit}
//                 disabled={isLoading}
//                 className="flex-1"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   'Create Conversation'
//                 )}
//               </Button>
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default NewConversationModal

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Loader2,
  Play,
  FileVideo,
  FileAudio,
  FileText,
  Link,
  Upload,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createConversationFromYoutube,
  createConversationFromUpload,
} from '@/api/conversations.api';

/**
 * 🚨 Feature Flag
 * YouTube disabled for now (under construction)
 */
const YOUTUBE_ENABLED = false;

const TYPES = [
  !YOUTUBE_ENABLED
    ? {
        id: 'youtube',
        label: 'YouTube (Coming Soon)',
        description: 'Temporarily under construction',
        icon: Play,
        accept: null,
        disabled: true,
      }
    : {
        id: 'youtube',
        label: 'YouTube',
        description: 'Paste a YouTube video URL',
        icon: Play,
        accept: null,
      },
  {
    id: 'video',
    label: 'Video',
    description: 'Upload an MP4, MOV or AVI file',
    icon: FileVideo,
    accept: 'video/*',
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Upload an MP3, WAV or M4A file',
    icon: FileAudio,
    accept: 'audio/*',
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Upload a PDF document',
    icon: FileText,
    accept: 'application/pdf',
  },
];

const NewConversationModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setYoutubeUrl('');
    setFile(null);
    setIsDragging(false);
    onClose();
  };

  const handleTypeSelect = (type) => {
    if (type.disabled) return;
    setSelectedType(type);
    setStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (selectedType.id === 'youtube') {
      if (!youtubeUrl.trim()) {
        toast.error('Please enter a YouTube URL');
        return;
      }
    } else {
      if (!file) {
        toast.error('Please select a file');
        return;
      }
    }

    setIsLoading(true);

    try {
      let conversation;

      if (selectedType.id === 'youtube') {
        const res = await createConversationFromYoutube(youtubeUrl.trim());
        conversation = res.data;
      } else {
        const res = await createConversationFromUpload(file);
        conversation = res.data;
      }

      toast.success('Conversation created! Processing in background...');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      handleClose();
      navigate(`/app/conversations/${conversation.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? 'New Conversation'
              : `${selectedType?.label} Conversation`}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Choose the type of content you want to chat with'
              : selectedType?.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1 */}
        {step === 1 && (
          <div className='grid grid-cols-2 gap-3 py-2'>
            {TYPES.map((type) => {
              const Icon = type.icon;

              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  disabled={type.disabled}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all text-center
                    ${
                      type.disabled
                        ? 'opacity-40 cursor-not-allowed border-border'
                        : 'hover:border-primary hover:bg-accent cursor-pointer border-border'
                    }
                  `}
                >
                  <div className='bg-muted rounded-full p-3'>
                    <Icon className='h-6 w-6 text-foreground' />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>{type.label}</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className='space-y-4 py-2'>
            {selectedType?.id === 'youtube' ? (
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  YouTube URL
                </label>

                <div className='flex gap-2'>
                  <Link className='h-4 w-4 text-muted-foreground mt-3 shrink-0' />
                  <Input
                    placeholder='https://www.youtube.com/watch?v=...'
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              </div>
            ) : (
              <div
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                  ${
                    isDragging
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary hover:bg-accent/50'
                  }
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  id='file-upload'
                  type='file'
                  className='hidden'
                  accept={selectedType?.accept}
                  onChange={(e) => setFile(e.target.files[0])}
                />

                <Upload className='h-8 w-8 text-muted-foreground mx-auto mb-3' />

                {file ? (
                  <div>
                    <p className='font-medium text-foreground'>{file.name}</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className='font-medium text-foreground'>
                      Drop your file here or click to browse
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {selectedType?.accept}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className='flex gap-2 pt-2'>
              <Button
                variant='outline'
                onClick={() => setStep(1)}
                disabled={isLoading}
                className='flex-1'
              >
                Back
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className='flex-1'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  'Create Conversation'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;
