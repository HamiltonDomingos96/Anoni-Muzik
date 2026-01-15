
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
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 p-4 md:px-8 z-50">
      <audio 
        ref={audioRef} 
        src={song.audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-1/3">
          <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded shadow-lg object-cover" />
          <div className="overflow-hidden">
            <h4 className="font-medium text-white truncate">{song.title}</h4>
            <p className="text-xs text-slate-400 truncate">{song.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 w-full md:w-1/3">
          <div className="flex items-center gap-6">
            <button onClick={onPrev} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>
            </button>
            <button 
              onClick={onTogglePlay}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button onClick={onNext} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-full max-w-md text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-end gap-4 w-1/3">
          <button 
            onClick={onDownload}
            className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors text-slate-200"
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
