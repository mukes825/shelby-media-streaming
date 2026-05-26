import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, X, FileText, Download, Copy, Check, Sparkles, Image as ImageIcon, Video, Music } from 'lucide-react';
import { BlobItem } from '../types';

interface MediaPlayerProps {
  blob: BlobItem | null;
  onClose: () => void;
}

export default function MediaPlayer({ blob, onClose }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play when blob changes
  useEffect(() => {
    setIsPlaying(false);
  }, [blob]);

  if (!blob) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-white border border-pink-100 rounded-2xl p-8 shadow-sm text-center py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm">Awaiting Retrieval Stream</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Pick a media blob from the register below to instantly compile onchain routes and stream.
          </p>
        </div>
      </div>
    );
  }

  const isVideo = blob.type.startsWith("video/");
  const isAudio = blob.type.startsWith("audio/");
  const isImage = blob.type.startsWith("image/");
  const isDoc = !isVideo && !isAudio && !isImage;

  const handlePlayPause = () => {
    if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (isAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCopyStreamUrl = () => {
    const pubUrl = `https://api.shelbynet.shelby.xyz/shelby/blobs/${blob.id}/stream`;
    navigator.clipboard.writeText(pubUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="media-player-container" className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Upper header */}
      <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            {isVideo && <Video className="w-4 h-4" />}
            {isAudio && <Music className="w-4 h-4" />}
            {isImage && <ImageIcon className="w-4 h-4" />}
            {isDoc && <FileText className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-xs font-bold font-mono tracking-tight text-white truncate max-w-xs sm:max-w-md">{blob.name}</h2>
            <p className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-widest pt-0.5">
              Type: {blob.type}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition-colors"
          title="Close stream player"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Stream Area */}
      <div className="bg-slate-950 flex flex-col items-center justify-center min-h-[220px] max-h-[460px] overflow-hidden relative group">
        {isVideo && (
          <video
            ref={videoRef}
            src={blob.streamUrl}
            onClick={handlePlayPause}
            className="w-full h-full max-h-[420px] object-contain aspect-video"
            controls
          />
        )}

        {isAudio && (
          <div className="w-full max-w-lg px-6 py-12 flex flex-col items-center space-y-6">
            <audio
              ref={audioRef}
              src={blob.streamUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="hidden"
            />
            {/* Audio visualization track disk */}
            <div className={`w-28 h-28 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center border-4 border-slate-800 shadow-xl relative overflow-hidden ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }}>
              <div className="absolute inset-0 bg-slate-900/10" />
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 z-10 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              </div>
            </div>

            {/* Simulated progress slider bar */}
            <div className="w-full space-y-1.5 text-center">
              <p className="text-[11px] font-semibold text-slate-300">Decentralized Audio Broadcast</p>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-pink-500 rounded-full ${isPlaying ? 'w-2/3 animate-pulse' : 'w-1/4'}`} />
              </div>
            </div>

            {/* Custom Control Bar */}
            <div className="flex items-center gap-6">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-white text-slate-900 hover:bg-pink-100 flex items-center justify-center shadow-lg transition-all transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900 ml-0.5" />}
              </button>
            </div>
          </div>
        )}

        {isImage && (
          <div className="relative w-full h-80 flex items-center justify-center overflow-hidden bg-slate-950/80">
            <img
              src={blob.streamUrl}
              alt={blob.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {isDoc && (
          <div className="p-8 py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-100">Document Schema Blob</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Direct document preview pathways on browser sandbox are optimized. Download below to read full payload.
              </p>
            </div>
            <a
              href={blob.streamUrl}
              download={blob.name}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-pink-900/30"
            >
              <Download className="w-3.5 h-3.5" /> Download Document
            </a>
          </div>
        )}
      </div>

      {/* Meta details footer */}
      <div className="p-5 bg-slate-950/90 border-t border-slate-850/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Blob Description</span>
            <p className="text-slate-200 font-medium text-[11px] pt-0.5">{blob.description}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Hot Retrieval SLA</span>
            <span className="text-emerald-400 font-semibold text-[11px]">Instant Cache Streaming</span>
          </div>
        </div>

        {/* Copy streaming link area */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-4">
          <div className="overflow-hidden">
            <span className="text-[9px] text-slate-500 uppercase font-bold font-mono tracking-wider dark:text-slate-400">
              Permanent Stream URL
            </span>
            <div className="text-xs text-pink-400 font-mono truncate select-all">
              https://api.shelbynet.shelby.xyz/shelby/blobs/{blob.id}/stream
            </div>
          </div>
          <button
            onClick={handleCopyStreamUrl}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
              copied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-white hover:bg-slate-750"
            }`}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
