
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
      className={`group relative p-4 rounded-xl transition-all duration-300 cursor-pointer ${
        isCurrent ? 'bg-indigo-600/20 ring-1 ring-indigo-500' : 'bg-slate-800/50 hover:bg-slate-800'
      }`}
      onClick={() => onPlay(song)}
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
        <img 
          src={song.coverUrl} 
          alt={song.title} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110 active:scale-95">
            {isCurrent && isPlaying ? (
               <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
               </svg>
            ) : (
               <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M8 5v14l11-7z"/>
               </svg>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 truncate pr-2">{song.title}</h3>
          <p className="text-sm text-slate-400 truncate">{song.artist}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors flex-shrink-0"
          title="Baixar MP3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
      <span className="inline-block mt-2 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-slate-700 text-slate-300 rounded">
        {song.genre}
      </span>
    </div>
  );
};

export default MusicCard;
