import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, FileAudio } from 'lucide-react';
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
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    setMediaError(false);
  }, [sourceLink]);

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

  useEffect(() => {
    if (!citationRef) return;
    if (sourceType === 'pdf' && citationRef.pageNumber) {
      setPageNumber(citationRef.pageNumber);
    }
    if (sourceType === 'video') seekMedia(videoRef, citationRef.start);
    if (sourceType === 'audio') seekMedia(audioRef, citationRef.start);
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
    <div className='relative flex flex-col h-full bg-background'>
      {/* Processing Overlay */}
      {status === 'processing' && (
        <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4'>
          <div className='h-16 w-16 rounded-full border border-border bg-muted flex items-center justify-center'>
            <Loader2 className='h-7 w-7 animate-spin text-muted-foreground' />
          </div>
          <div className='text-center space-y-1'>
            <p className='font-medium text-foreground'>Processing your media</p>
            <p className='text-sm text-muted-foreground'>
              This may take a few minutes...
            </p>
          </div>
        </div>
      )}

      {/* Failed Overlay */}
      {status === 'failed' && (
        <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4'>
          <div className='h-16 w-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center'>
            <AlertCircle className='h-7 w-7 text-red-400' />
          </div>
          <div className='text-center space-y-1'>
            <p className='font-medium text-foreground'>Processing failed</p>
            <p className='text-sm text-muted-foreground max-w-xs text-center'>
              {conversation.errorMessage || 'Something went wrong'}
            </p>
          </div>
        </div>
      )}

      {/* YouTube */}
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
        <div className='relative w-full h-full flex items-center justify-center'>
          {mediaError ? (
            <div className='flex flex-col items-center justify-center gap-3'>
              <div className='h-16 w-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center'>
                <AlertCircle className='h-7 w-7 text-red-400' />
              </div>
              <p className='text-muted-foreground text-sm'>
                Failed to load video
              </p>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={sourceLink}
              controls
              className='w-full h-full object-contain'
              preload='metadata'
              onError={() => setMediaError(true)}
            />
          )}

          {isSeeking && !mediaError && (
            <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3 pointer-events-none'>
              <Loader2 className='h-8 w-8 animate-spin text-foreground' />
              <p className='text-foreground text-sm font-medium'>
                Jumping to {formatTime(seekTarget)}...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audio */}
      {sourceType === 'audio' && (
        <div className='flex flex-col items-center justify-center h-full gap-8 p-8'>
          <div className='absolute inset-0 bg-background/40 pointer-events-none' />

          <div className='relative'>
            <div className='absolute inset-0 bg-muted blur-2xl rounded-full scale-150' />
            <div className='relative h-28 w-28 rounded-full bg-background border border-border flex items-center justify-center'>
              <FileAudio className='h-12 w-12 text-muted-foreground' />
            </div>
          </div>

          <div className='text-center space-y-1 max-w-sm'>
            <p className='font-semibold text-foreground text-lg leading-snug'>
              {conversation.title}
            </p>
            <p className='text-sm text-muted-foreground'>Audio</p>
          </div>

          {isSeeking && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Jumping to {formatTime(seekTarget)}...
            </div>
          )}

          {mediaError ? (
            <div className='flex flex-col items-center justify-center gap-3'>
              <div className='h-16 w-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center'>
                <AlertCircle className='h-7 w-7 text-red-400' />
              </div>
              <p className='text-muted-foreground text-sm'>
                Failed to load audio
              </p>
            </div>
          ) : (
            <audio
              ref={audioRef}
              src={sourceLink}
              controls
              className='w-full max-w-sm'
              preload='metadata'
              onError={() => setMediaError(true)}
              style={{ filter: 'invert(1) hue-rotate(180deg)' }}
            />
          )}
        </div>
      )}

      {/* PDF */}
      {sourceType === 'pdf' && (
        <div className='flex flex-col h-full'>
          {/* Toolbar */}
          <div className='flex items-center justify-between px-6 py-3 shrink-0 bg-muted border-b border-border'>
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className='text-sm px-4 py-1.5 rounded-lg bg-background hover:bg-accent text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
            >
              ← Prev
            </button>

            <span className='text-sm text-muted-foreground font-medium'>
              {pageNumber} / {numPages || '—'}
            </span>

            <button
              onClick={() =>
                setPageNumber((p) => Math.min(numPages || p, p + 1))
              }
              disabled={pageNumber >= (numPages || 1)}
              className='text-sm px-4 py-1.5 rounded-lg bg-background hover:bg-accent text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
            >
              Next →
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-auto flex justify-center p-6 bg-background'>
            <div className='shadow-2xl shadow-black/10'>
              <Document
                file={sourceLink}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={(error) => console.error('PDF load error:', error)}
                loading={
                  <div className='flex items-center justify-center py-20'>
                    <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(window.innerWidth * 0.45, 680)}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaViewer;
