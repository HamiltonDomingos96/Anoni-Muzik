
import React from 'react';
import { Song } from '../types';

interface MusicCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  onDownload: () => void;
  isCurrent: boolean;
  isPlaying: boolean;
  isFeatured?: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ song, onPlay, onDownload, isCurrent, isPlaying, isFeatured }) => {
  return (
    <div 
      className={`group relative transition-all duration-500 cursor-pointer overflow-hidden ${
        isFeatured 
        ? 'p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-slate-900 border border-white/10' 
        : `p-2 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] ${isCurrent ? 'bg-amber-500/10 ring-1 ring-amber-500/30 shadow-2xl shadow-amber-500/5' : 'bg-slate-900/50 hover:bg-slate-900 border border-white/5'}`
      }`}
      onClick={() => onPlay(song)}
    >
      <div className={`relative overflow-hidden rounded-[1rem] md:rounded-[1.5rem] shadow-2xl mb-3 md:mb-4 ${isFeatured ? 'aspect-[4/3]' : 'aspect-square'}`}>
        <img 
          src={song.coverUrl} 
          alt={song.title} 
          className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        <div className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110 active:scale-90">
            {isCurrent && isPlaying ? (
               <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
               </svg>
            ) : (
               <svg className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M8 5v14l11-7z"/>
               </svg>
            )}
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex gap-2">
          {isFeatured && (
            <span className="px-2 md:px-3 py-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest bg-amber-500 text-black rounded-lg">
              HOT
            </span>
          )}
          <span className="px-2 md:px-3 py-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest bg-black/70 text-white backdrop-blur-md rounded-lg border border-white/10">
            {song.genre}
          </span>
        </div>

        {/* Stats overlay for featured */}
        {isFeatured && (
          <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 flex items-center gap-2 md:gap-3 bg-black/70 backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-white/10">
             <div className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-black text-amber-500">
               <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
               {song.plays}
             </div>
             <div className="w-px h-2 bg-white/20" />
             <div className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-black text-white">
               <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
               {song.downloads}
             </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center px-0.5 md:px-1">
        <div className="flex-1 min-w-0">
          <h3 className={`font-black text-white truncate tracking-tight uppercase leading-tight ${isFeatured ? 'text-base md:text-xl' : 'text-xs md:text-base'}`}>{song.title}</h3>
          <p className="text-[8px] md:text-[10px] text-slate-500 font-bold truncate uppercase tracking-widest mt-0.5">{song.artist}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="ml-2 md:ml-4 p-2 md:p-3 bg-white/5 text-slate-400 hover:text-black hover:bg-amber-500 rounded-lg md:rounded-xl transition-all active:scale-90"
          title="Baixar MP3"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MusicCard;
