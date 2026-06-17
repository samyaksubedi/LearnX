import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const MediaViewer = ({ conversation, status, citationRef }) => {
  const { sourceType, sourceLink } = conversation;
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);
  const [youtubeStart, setYoutubeStart] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTarget, setSeekTarget] = useState(null);

  // Pause media when processing
  useEffect(() => {
    if (status === 'processing') {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
    }
  }, [status]);

  const seekMedia = (ref, start) => {
    if (!ref.current) return;
    const media = ref.current;

    setIsSeeking(true);
    setSeekTarget(start);

    const doSeek = () => {
      media.currentTime = start;
      const onSeeked = () => {
        media.play().catch(() => {});
        setIsSeeking(false);
        setSeekTarget(null);
        media.removeEventListener('seeked', onSeeked);
      };
      media.addEventListener('seeked', onSeeked);
    };

    if (media.readyState >= 2) {
      doSeek();
    } else {
      const handler = () => {
        doSeek();
        media.removeEventListener('loadedmetadata', handler);
      };
      media.addEventListener('loadedmetadata', handler);
    }
  };

  // citationRef is wrapped with a counter in ConversationPage
  // so this always fires even for same start/end values
  useEffect(() => {
    if (!citationRef) return;

    if (sourceType === 'pdf' && citationRef.pageNumber) {
      setPageNumber(citationRef.pageNumber);
    }
    if (sourceType === 'video') {
      seekMedia(videoRef, citationRef.start);
    }
    if (sourceType === 'audio') {
      seekMedia(audioRef, citationRef.start);
    }
    if (sourceType === 'youtube') {
      setYoutubeStart(Math.floor(citationRef.start));
      setIframeKey((k) => k + 1);
    }
  }, [citationRef]);

  const getYoutubeId = (url) => {
    const match = url?.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?\s]+)/,
    );
    return match?.[1] || '';
  };

  const youtubeId = sourceType === 'youtube' ? getYoutubeId(sourceLink) : null;

  return (
    <div className='relative flex flex-col h-full bg-black/5'>
      {/* Processing Overlay */}
      {status === 'processing' && (
        <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3'>
          <Loader2 className='h-10 w-10 animate-spin text-foreground' />
          <p className='font-medium text-foreground'>
            Processing your media...
          </p>
          <p className='text-sm text-muted-foreground'>
            This may take a few minutes
          </p>
        </div>
      )}

      {/* Failed Overlay */}
      {status === 'failed' && (
        <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3'>
          <AlertCircle className='h-10 w-10 text-destructive' />
          <p className='font-medium text-foreground'>Processing failed</p>
          <p className='text-sm text-muted-foreground text-center max-w-xs'>
            {conversation.errorMessage ||
              'Something went wrong while processing your media'}
          </p>
        </div>
      )}

      {/* YouTube — always render but only autoplay when ready */}
      {sourceType === 'youtube' && youtubeId && (
        <iframe
          key={iframeKey}
          src={`https://www.youtube.com/embed/${youtubeId}?start=${youtubeStart}&autoplay=${iframeKey > 0 && status === 'ready' ? 1 : 0}`}
          className='w-full h-full'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      )}

      {/* Video */}
      {sourceType === 'video' && (
        <div className='relative w-full h-full'>
          <video
            ref={videoRef}
            src={sourceLink}
            controls
            className='w-full h-full object-contain'
            preload='metadata'
          />
          {isSeeking && (
            <div className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 pointer-events-none'>
              <Loader2 className='h-8 w-8 animate-spin text-white' />
              <p className='text-white text-sm font-medium'>
                Seeking to {formatTime(seekTarget)}...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audio */}
      {sourceType === 'audio' && (
        <div className='flex flex-col items-center justify-center h-full gap-6 p-8'>
          <div className='bg-muted rounded-full p-12'>
            <div className='h-16 w-16 text-muted-foreground'>🎵</div>
          </div>
          <p className='font-medium text-foreground text-center'>
            {conversation.title}
          </p>
          {isSeeking && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Seeking to {formatTime(seekTarget)}...
            </div>
          )}
          <audio
            ref={audioRef}
            src={sourceLink}
            controls
            className='w-full max-w-md'
            preload='metadata'
          />
        </div>
      )}

      {/* PDF */}
      {sourceType === 'pdf' && (
        <div className='flex flex-col h-full'>
          <div className='flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0'>
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className='text-sm px-3 py-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
            >
              ← Prev
            </button>
            <span className='text-sm text-muted-foreground'>
              Page {pageNumber} {numPages ? `of ${numPages}` : ''}
            </span>
            <button
              onClick={() =>
                setPageNumber((p) => Math.min(numPages || p, p + 1))
              }
              disabled={pageNumber >= (numPages || 1)}
              className='text-sm px-3 py-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next →
            </button>
          </div>
          <div className='flex-1 overflow-auto flex justify-center p-4'>
            <Document
              file={sourceLink}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={Math.min(window.innerWidth * 0.5, 700)}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaViewer;
