
import React, { useRef, useEffect, useState } from 'react';
import { Song } from '../types';

interface PlayerProps {
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDownload?: () => void;
}

const Player: React.FC<PlayerProps> = ({ song, isPlaying, onTogglePlay, onNext, onPrev, onDownload }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, song]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!song) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-2xl border-t border-white/5 px-4 py-6 md:px-10 z-50 animate-in slide-in-from-bottom duration-500">
      <audio 
        ref={audioRef} 
        src={song.audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-1/4">
          <div className="relative group">
            <img src={song.coverUrl} alt={song.title} className="w-14 h-14 rounded-xl shadow-2xl object-cover ring-1 ring-white/10" />
            <div className="absolute inset-0 bg-amber-500/20 animate-pulse rounded-xl" />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-white truncate text-base tracking-tighter uppercase">{song.title}</h4>
            <p className="text-xs text-slate-500 font-bold truncate uppercase tracking-widest">{song.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 flex-1 w-full">
          <div className="flex items-center justify-center gap-10">
            <button onClick={onPrev} className="text-slate-500 hover:text-white transition-all transform hover:scale-125">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>
            </button>
            <button 
              onClick={onTogglePlay}
              className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl shadow-white/10"
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button onClick={onNext} className="text-slate-500 hover:text-white transition-all transform hover:scale-125">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-4 w-full text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">
            <span>{formatTime(currentTime)}</span>
            <div className="relative flex-1 group">
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                value={currentTime} 
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-end gap-6 w-1/4">
          <button 
            onClick={onDownload}
            className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] bg-white text-black px-6 py-3 rounded-xl hover:bg-amber-500 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
