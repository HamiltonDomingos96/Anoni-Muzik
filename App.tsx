
import React, { useState, useCallback, useEffect } from 'react';
import { MOCK_SONGS } from './constants';
import { Song, SiteSettings } from './types';
import MusicCard from './components/MusicCard';
import Player from './components/Player';
import AdminArea from './components/AdminArea';

const INITIAL_SETTINGS: SiteSettings = {
  siteName: "Anoni Muzik",
  logoUrl: "", // Empty means use icon
  heroTitle: "A maior montra da música nacional.",
  heroSubtitle: "Distribuição anônima e gratuita. Os ritmos que movem a nossa terra em um só lugar.",
  heroImageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
  accentColor: "#f59e0b", // Warm amber for a corporate feel
  footerText: "site criado por Hamilton Almeida Domingos"
};

const CATEGORIES = ['Todos', 'Rap', 'Kuduro', 'Afro House', 'Semba', 'Kizomba', 'Zouk'];

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('anoni_songs');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any) => ({
        ...s,
        plays: s.plays ?? 0,
        downloads: s.downloads ?? 0
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

  useEffect(() => {
    localStorage.setItem('anoni_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('anoni_settings', JSON.stringify(settings));
  }, [settings]);

  const incrementPlay = useCallback((songId: string) => {
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, plays: s.plays + 1 } : s));
  }, []);

  const handleDownload = useCallback((song: Song) => {
    setSongs(prev => prev.map(s => s.id === song.id ? { ...s, downloads: s.downloads + 1 } : s));
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
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="min-h-screen pb-40 bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 self-start md:self-auto">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20" style={{ backgroundColor: settings.accentColor }}>
                <svg className="w-6 h-6 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">{settings.siteName}</h1>
          </div>
          
          <div className="relative w-full md:w-96 group">
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
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-grow">
        <section className="mb-12 rounded-[2rem] overflow-hidden relative min-h-[400px] flex items-end p-6 md:p-16 shadow-2xl border border-white/5">
          <img src={settings.heroImageUrl} alt="Main Visual" className="absolute inset-0 object-cover w-full h-full scale-105 group-hover:scale-100 transition-transform duration-1000 brightness-[0.3]" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
              {settings.heroTitle}
            </h2>
            <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-xl font-medium leading-relaxed">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                className="text-slate-950 px-10 py-4 rounded-2xl font-black uppercase text-sm shadow-xl transform hover:-translate-y-1 transition-all active:scale-95"
                style={{ backgroundColor: settings.accentColor }}
              >
                Explorar Agora
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Categories */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSearchQuery(cat === 'Todos' ? '' : cat)}
              className={`whitespace-nowrap px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) 
                ? 'bg-white text-black shadow-lg scale-105' 
                : 'bg-slate-900 text-slate-500 border border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Music List */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-500 font-black text-xs uppercase tracking-widest mb-2">Streaming de Elite</p>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {searchQuery ? `Destaques em ${searchQuery}` : 'Lançamentos Recentes'}
              </h3>
            </div>
            <span className="text-slate-600 text-sm font-mono">{filteredSongs.length} TRACKS FOUND</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredSongs.map(song => (
              <MusicCard 
                key={song.id} 
                song={song} 
                onPlay={handlePlaySong}
                onDownload={() => handleDownload(song)}
                isCurrent={currentSong?.id === song.id}
                isPlaying={isPlaying && currentSong?.id === song.id}
              />
            ))}
          </div>
          {filteredSongs.length === 0 && (
            <div className="py-20 text-center bg-slate-900/30 rounded-3xl border border-dashed border-white/10">
              <p className="text-slate-500 font-medium">Nenhuma música encontrada para esta categoria.</p>
            </div>
          )}
        </section>
      </main>

      {/* Admin Disguise Footer */}
      <footer className="py-16 border-t border-white/5 flex flex-col items-center gap-4">
        <div className="text-slate-700 text-[10px] font-black tracking-[0.2em] uppercase">© {new Date().getFullYear()} {settings.siteName} Premium Distribution</div>
        <button 
          onClick={() => setShowLoginModal(true)}
          className="text-slate-800 text-[10px] font-medium hover:text-amber-500/50 transition-colors cursor-default"
        >
          {settings.footerText}
        </button>
      </footer>

      {/* Password Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <h3 className="text-2xl font-black mb-8 text-center tracking-tighter">AUTHENTICATION</h3>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input 
                type="password"
                placeholder="ACCESS CODE"
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full bg-black/40 border ${loginError ? 'border-red-500' : 'border-white/10'} p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center tracking-[0.5em] font-black text-xl`}
              />
              <div className="flex flex-col gap-3">
                <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-sm hover:bg-amber-500 transition-colors">Confirm Identity</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="w-full py-2 text-slate-500 font-bold text-xs uppercase hover:text-white transition-colors">Abort</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Player 
        song={currentSong}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
        onDownload={currentSong ? () => handleDownload(currentSong) : undefined}
      />
    </div>
  );
};

export default App;
