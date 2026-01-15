
import React, { useState, useCallback, useEffect } from 'react';
import { MOCK_SONGS } from './constants';
import { Song, SiteSettings } from './types';
import MusicCard from './components/MusicCard';
import Player from './components/Player';
import AdminArea from './components/AdminArea';

const INITIAL_SETTINGS: SiteSettings = {
  siteName: "Anoni Muzik",
  heroTitle: "A música sem fronteiras.",
  heroSubtitle: "Totalmente anônima. Descubra novos sons, publique suas batidas e baixe o que quiser.",
  heroImageUrl: "https://picsum.photos/seed/abstract/1200/400",
  accentColor: "#4f46e5"
};

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('anoni_songs');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure existing saved songs have the new properties
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
    <div className="min-h-screen pb-32 bg-slate-950 text-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: settings.accentColor }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{settings.siteName}</h1>
          </div>
          
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Buscar músicas, artistas ou gêneros..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 px-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-colors">Entrar</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 flex-grow">
        <section className="mb-12 rounded-3xl overflow-hidden relative h-64 md:h-80 flex items-center p-8 md:p-12 shadow-2xl">
          <img src={settings.heroImageUrl} alt="Hero" className="absolute inset-0 object-cover w-full h-full brightness-[0.4]" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{settings.heroTitle}</h2>
            <p className="text-slate-200 text-lg mb-6 opacity-90">{settings.heroSubtitle}</p>
            <button 
              className="text-white px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all active:scale-95"
              style={{ backgroundColor: settings.accentColor }}
            >
              Começar Agora
            </button>
          </div>
        </section>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['Todos', 'Regional', 'Synthwave', 'Hip Hop', 'Acoustic', 'Electronic', 'Ambient'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setSearchQuery(cat === 'Todos' ? '' : cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all ${
                (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) 
                ? 'bg-white text-black' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Explorar Músicas'}
            </h3>
            <span className="text-slate-400 text-sm">{filteredSongs.length} faixas</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
        </section>
      </main>

      <footer className="py-12 border-t border-slate-900 flex justify-center items-center">
        <button 
          onClick={() => setShowLoginModal(true)}
          className="text-slate-700 text-xs font-medium hover:text-slate-500 transition-colors cursor-default"
        >
          site criado por Hamilton Almeida Domingos
        </button>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-center">Acesso Restrito</h3>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password"
                placeholder="Código de Acesso"
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full bg-slate-950 border ${loginError ? 'border-red-500' : 'border-slate-700'} p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center tracking-widest`}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 py-3 text-slate-400">Cancelar</button>
                <button type="submit" className="flex-1 bg-white text-black font-bold py-3 rounded-xl">Entrar</button>
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
