
import React from 'react';
import { Song } from '../types';

interface MusicCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  isCurrent: boolean;
  isPlaying: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ song, onPlay, isCurrent, isPlaying }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.artist} - ${song.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
            {isCurrent && isPlaying ? (
               <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
               <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-100 truncate w-32 md:w-40">{song.title}</h3>
          <p className="text-sm text-slate-400 truncate">{song.artist}</p>
        </div>
        <button 
          onClick={handleDownload}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
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
