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

  // Reset error when sourceLink changes
  useEffect(() => {
    setMediaError(false);
  }, [sourceLink]);

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
    <div className='relative flex flex-col h-full bg-[#0a0a0a]'>
      {/* Processing Overlay */}
      {status === 'processing' && (
        <div className='absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4'>
          <div className='h-16 w-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center'>
            <Loader2 className='h-7 w-7 animate-spin text-white/70' />
          </div>
          <div className='text-center space-y-1'>
            <p className='font-medium text-white'>Processing your media</p>
            <p className='text-sm text-white/40'>
              This may take a few minutes...
            </p>
          </div>
        </div>
      )}

      {/* Failed Overlay */}
      {status === 'failed' && (
        <div className='absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4'>
          <div className='h-16 w-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center'>
            <AlertCircle className='h-7 w-7 text-red-400' />
          </div>
          <div className='text-center space-y-1'>
            <p className='font-medium text-white'>Processing failed</p>
            <p className='text-sm text-white/40 max-w-xs text-center'>
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
              <p className='text-white/60 text-sm'>Failed to load video</p>
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
            <div className='absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 pointer-events-none'>
              <Loader2 className='h-8 w-8 animate-spin text-white' />
              <p className='text-white/80 text-sm font-medium'>
                Jumping to {formatTime(seekTarget)}...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audio */}
      {sourceType === 'audio' && (
        <div className='flex flex-col items-center justify-center h-full gap-8 p-8'>
          <div className='absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent pointer-events-none' />

          <div className='relative'>
            <div className='absolute inset-0 bg-purple-500/20 blur-2xl rounded-full scale-150' />
            <div className='relative h-28 w-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center'>
              <FileAudio className='h-12 w-12 text-white/40' />
            </div>
          </div>

          <div className='text-center space-y-1 max-w-sm'>
            <p className='font-semibold text-white text-lg leading-snug'>
              {conversation.title}
            </p>
            <p className='text-sm text-white/30'>Audio</p>
          </div>

          {isSeeking && (
            <div className='flex items-center gap-2 text-sm text-white/50'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Jumping to {formatTime(seekTarget)}...
            </div>
          )}

          {mediaError ? (
            <div className='flex flex-col items-center justify-center gap-3'>
              <div className='h-16 w-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center'>
                <AlertCircle className='h-7 w-7 text-red-400' />
              </div>
              <p className='text-white/60 text-sm'>Failed to load audio</p>
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
          {/* PDF Toolbar */}
          <div className='flex items-center justify-between px-6 py-3 shrink-0 bg-[#111111] border-b border-white/5'>
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className='text-sm px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
            >
              ← Prev
            </button>
            <span className='text-sm text-white/40 font-medium'>
              {pageNumber} / {numPages || '—'}
            </span>
            <button
              onClick={() =>
                setPageNumber((p) => Math.min(numPages || p, p + 1))
              }
              disabled={pageNumber >= (numPages || 1)}
              className='text-sm px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
            >
              Next →
            </button>
          </div>

          {/* PDF Content */}
          <div className='flex-1 overflow-auto flex justify-center p-6 bg-[#0a0a0a]'>
            <div className='shadow-2xl shadow-black/50'>
              <Document
                file={sourceLink}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={(error) => console.error('PDF load error:', error)}
                error={
                  <div className='flex flex-col items-center justify-center py-20 gap-3'>
                    <div className='h-16 w-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center'>
                      <AlertCircle className='h-7 w-7 text-red-400' />
                    </div>
                    <p className='text-white/60 text-sm'>Failed to load PDF</p>
                  </div>
                }
                loading={
                  <div className='flex items-center justify-center py-20'>
                    <Loader2 className='h-8 w-8 animate-spin text-white/30' />
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(window.innerWidth * 0.45, 680)}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  error={
                    <div className='flex flex-col items-center justify-center py-20 gap-3'>
                      <AlertCircle className='h-7 w-7 text-red-400' />
                      <p className='text-white/60 text-sm'>
                        Failed to load page {pageNumber}
                      </p>
                    </div>
                  }
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
