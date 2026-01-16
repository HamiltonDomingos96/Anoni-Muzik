
import React, { useState } from 'react';
import { Song } from '../types';

interface MusicCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  onDownload: () => void;
  onLike: () => void;
  isCurrent: boolean;
  isPlaying: boolean;
  isFeatured?: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ song, onPlay, onDownload, onLike, isCurrent, isPlaying, isFeatured }) => {
  const [copied, setCopied] = useState(false);

  // Generate individual song permalink
  const getPermalink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#song=${song.id}`;
  };

  const handleUniversalShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const permalink = getPermalink();
    const shareData = {
      title: song.title,
      text: `Ouve agora: ${song.title} - ${song.artist} no Anoni Muzik!`,
      url: permalink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback if Web Share API is not available
      handleCopyLink(e);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const permalink = getPermalink();
    navigator.clipboard.writeText(permalink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  };

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

        {/* Stats overlay */}
        <div className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 flex items-center gap-2 md:gap-3 bg-black/70 backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-white/10 transition-opacity ${isFeatured ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
           <div className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-black text-amber-500">
             <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
             {song.plays}
           </div>
           <div className="w-px h-2 bg-white/20" />
           <div className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-black text-red-500">
             <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             {song.likes}
           </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center px-0.5 md:px-1 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-black text-white truncate tracking-tight uppercase leading-tight ${isFeatured ? 'text-sm md:text-lg' : 'text-xs md:text-sm'}`}>{song.title}</h3>
          <p className="text-[8px] md:text-[10px] text-slate-500 font-bold truncate uppercase tracking-widest mt-0.5">{song.artist}</p>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLikeClick}
            className="p-1.5 md:p-2 bg-red-600/10 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-all active:scale-90"
            title="Adoro"
          >
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          
          <button 
            onClick={handleUniversalShare}
            className="p-1.5 md:p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all active:scale-90"
            title="Partilhar"
          >
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <button 
            onClick={handleCopyLink}
            className={`p-1.5 md:p-2 rounded-lg transition-all active:scale-90 ${copied ? 'bg-green-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
            title="Copiar Link"
          >
            {copied ? (
              <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="p-1.5 md:p-2 bg-white/5 text-slate-400 hover:text-black hover:bg-amber-500 rounded-lg transition-all active:scale-90"
            title="Baixar MP3"
          >
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
