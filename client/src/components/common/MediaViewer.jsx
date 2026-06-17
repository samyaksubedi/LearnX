import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MediaViewer = ({ conversation, status, citationRef }) => {
  const { sourceType, sourceLink } = conversation;
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [iframeKey, setIframeKey] = useState(0); // ← counter to force iframe remount
  const [youtubeStart, setYoutubeStart] = useState(0);

  // Handle citation jumps
  useEffect(() => {
    if (!citationRef) return;

    if (sourceType === 'pdf' && citationRef.pageNumber) {
      setPageNumber(citationRef.pageNumber);
    }

    if (sourceType === 'video' && videoRef.current) {
      videoRef.current.currentTime = citationRef.start;
      videoRef.current.play();
    }

    if (sourceType === 'audio' && audioRef.current) {
      audioRef.current.currentTime = citationRef.start;
      audioRef.current.play();
    }

    if (sourceType === 'youtube') {
      setYoutubeStart(Math.floor(citationRef.start)); // ← update start
      setIframeKey((k) => k + 1); // ← force remount every time
    }
  }, [citationRef]);

  // Extract YouTube video ID
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

      {/* YouTube */}
      {sourceType === 'youtube' && youtubeId && (
        <iframe
          key={iframeKey}
          src={`https://www.youtube.com/embed/${youtubeId}?start=${youtubeStart}&autoplay=${iframeKey > 0 ? 1 : 0}`}
          className='w-full h-full'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      )}

      {/* Video */}
      {sourceType === 'video' && (
        <video
          ref={videoRef}
          src={sourceLink}
          controls
          className='w-full h-full object-contain'
        />
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
          <audio
            ref={audioRef}
            src={sourceLink}
            controls
            className='w-full max-w-md'
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
