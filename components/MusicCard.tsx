
import React from 'react';
import { Song } from '../types';

interface MusicCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  onDownload: () => void;
  isCurrent: boolean;
  isPlaying: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ song, onPlay, onDownload, isCurrent, isPlaying }) => {
  return (
    <div 
      className={`group relative p-3 rounded-[1.5rem] transition-all duration-500 cursor-pointer overflow-hidden ${
        isCurrent ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : 'bg-slate-900/50 hover:bg-slate-900 border border-white/5'
      }`}
      onClick={() => onPlay(song)}
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl shadow-2xl">
        <img 
          src={song.coverUrl} 
          alt={song.title} 
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110 active:scale-90">
            {isCurrent && isPlaying ? (
               <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
               </svg>
            ) : (
               <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M8 5v14l11-7z"/>
               </svg>
            )}
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-black/80 text-amber-500 backdrop-blur-md rounded-lg border border-white/10">
            {song.genre}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center px-1 pb-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate text-base tracking-tight">{song.title}</h3>
          <p className="text-xs text-slate-500 font-medium truncate uppercase tracking-tighter">{song.artist}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="ml-3 p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-amber-500 hover:text-black rounded-xl transition-all active:scale-90"
          title="Baixar MP3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MusicCard;
