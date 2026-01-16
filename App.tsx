
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MOCK_SONGS } from './constants';
import { Song, SiteSettings } from './types';
import MusicCard from './components/MusicCard';
import Player from './components/Player';
import AdminArea from './components/AdminArea';

const INITIAL_SETTINGS: SiteSettings = {
  siteName: "Anoni Muzik",
  logoUrl: "", 
  heroTitle: "A maior montra da música nacional.",
  heroSubtitle: "Distribuição anônima e gratuita. Os ritmos que movem a nossa terra em um só lugar.",
  heroImageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
  accentColor: "#f59e0b",
  backgroundColor: "#020617", // Default slate-950
  footerText: "site criado por Hamilton Almeida Domingos"
};

const CATEGORIES = ['Todos', 'Rap', 'Kuduro', 'Afro House', 'Semba', 'Kizomba', 'Zouk'];
const PERFORMANCE_FILTERS = ['Recentes', 'Mais Ouvidas', 'Mais Baixadas', 'Mais Amadas'];

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('anoni_songs');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({
        ...s,
        plays: s.plays ?? 0,
        downloads: s.downloads ?? 0,
        likes: s.likes ?? 0,
        isFeatured: s.isFeatured ?? false
      }));
    }
    return MOCK_SONGS;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('anoni_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('Recentes');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#song=')) {
      const songId = hash.replace('#song=', '');
      const sharedSong = songs.find(s => s.id === songId);
      if (sharedSong) {
        setCurrentSong(sharedSong);
        setTimeout(() => {
          const element = document.getElementById(`song-card-${songId}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('anoni_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('anoni_settings', JSON.stringify(settings));
  }, [settings]);

  const incrementPlay = useCallback((songId: string) => {
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, plays: (s.plays || 0) + 1 } : s));
  }, []);

  const handleLike = useCallback((songId: string) => {
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, likes: (s.likes || 0) + 1 } : s));
  }, []);

  const handleDownload = useCallback((song: Song) => {
    setSongs(prev => prev.map(s => s.id === song.id ? { ...s, downloads: (s.downloads || 0) + 1 } : s));
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.artist} - ${song.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handlePlaySong = useCallback((song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      incrementPlay(song.id);
    }
  }, [currentSong, incrementPlay]);

  const handleNext = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    setCurrentSong(nextSong);
    setIsPlaying(true);
    incrementPlay(nextSong.id);
  }, [currentSong, songs, incrementPlay]);

  const handlePrev = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    setCurrentSong(prevSong);
    setIsPlaying(true);
    incrementPlay(prevSong.id);
  }, [currentSong, songs, incrementPlay]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '963008') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setShowMenu(false);
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const trendingSongs = useMemo(() => {
    const manualFeatured = songs.filter(s => s.isFeatured);
    if (manualFeatured.length > 0) return manualFeatured;
    return [...songs].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6);
  }, [songs]);

  const filteredAndSortedSongs = useMemo(() => {
    let result = songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (performanceFilter === 'Mais Ouvidas') {
      result = result.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    } else if (performanceFilter === 'Mais Baixadas') {
      result = result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (performanceFilter === 'Mais Amadas') {
      result = result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      result = [...result].reverse();
    }

    return result;
  }, [songs, searchQuery, performanceFilter]);

  if (isAdmin) {
    return (
      <AdminArea 
        songs={songs} 
        setSongs={setSongs} 
        settings={settings} 
        setSettings={setSettings} 
        onClose={() => setIsAdmin(false)} 
      />
    );
  }

  return (
    <div 
      className="min-h-screen pb-40 text-slate-50 flex flex-col font-sans overflow-x-hidden transition-colors duration-700"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <nav className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: settings.accentColor }}>
              <svg className="w-6 h-6 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-white">{settings.siteName}</h1>
          </div>
          
          <div className="hidden md:flex relative w-96 group">
            <input 
              type="text" 
              placeholder="Pesquisar batidas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all placeholder:text-slate-600"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button 
            onClick={() => setShowMenu(true)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-grow">
        <section className="mb-12 rounded-[2.5rem] overflow-hidden relative min-h-[300px] md:min-h-[400px] flex items-end p-6 md:p-12 shadow-2xl border border-white/5">
          <img src={settings.heroImageUrl} alt="Hero" className="absolute inset-0 object-cover w-full h-full brightness-[0.3]" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-6xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
              {settings.heroTitle}
            </h2>
            <p className="text-slate-300 text-base md:text-xl mb-8 max-w-xl font-medium leading-relaxed">
              {settings.heroSubtitle}
            </p>
            <button 
              className="text-slate-950 px-8 py-3.5 rounded-2xl font-black uppercase text-xs shadow-xl transform hover:-translate-y-1 transition-all active:scale-95"
              style={{ backgroundColor: settings.accentColor }}
            >
              Explorar Agora
            </button>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: settings.accentColor }} />
            <h3 className="text-2xl font-black tracking-tight uppercase text-white">Em Destaque (Hot)</h3>
          </div>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x scroll-smooth no-scrollbar">
            {trendingSongs.map((song) => (
              <div key={song.id} id={`song-card-${song.id}`} className="min-w-[240px] md:min-w-[320px] snap-start">
                <MusicCard 
                  song={song}
                  onPlay={handlePlaySong}
                  onDownload={() => handleDownload(song)}
                  onLike={() => handleLike(song.id)}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying && currentSong?.id === song.id}
                  isFeatured
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSearchQuery(cat === 'Todos' ? '' : cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) 
                ? 'text-black shadow-lg' 
                : 'bg-slate-900/50 text-slate-500 border border-white/5 hover:text-white'
              }`}
              style={{ 
                backgroundColor: (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) ? settings.accentColor : undefined,
                boxShadow: (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) ? `0 10px 15px -3px ${settings.accentColor}40` : undefined
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-xl font-black text-white tracking-tight uppercase">
              {searchQuery ? `${searchQuery}` : 'Catálogo Completo'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {filteredAndSortedSongs.map(song => (
              <div key={song.id} id={`song-card-${song.id}`}>
                <MusicCard 
                  song={song} 
                  onPlay={handlePlaySong}
                  onDownload={() => handleDownload(song)}
                  onLike={() => handleLike(song.id)}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying && currentSong?.id === song.id}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 flex flex-col items-center gap-8">
        <div className="flex items-center gap-2 opacity-70">
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: settings.accentColor }} />
          <span className="text-sm font-black tracking-tighter uppercase italic text-white">{settings.siteName}</span>
        </div>
        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          {settings.footerText}
        </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: settings.accentColor }} />
            <h3 className="text-lg font-black mb-8 text-center tracking-widest uppercase text-white/50">Terminal Access</h3>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input 
                type="password" placeholder="TOKEN" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center tracking-[0.5em] font-black text-2xl text-white"
              />
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-amber-500 transition-all shadow-lg">Authenticate</button>
            </form>
          </div>
        </div>
      )}

      <Player song={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} onNext={handleNext} onPrev={handlePrev} onDownload={currentSong ? () => handleDownload(currentSong) : undefined} />
    </div>
  );
};

export default App;
