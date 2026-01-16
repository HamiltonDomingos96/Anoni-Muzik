
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
  backgroundColor: "#020617",
  footerText: "site criado por Hamilton Almeida Domingos"
};

const CATEGORIES = ['Todos', 'Rap', 'Kuduro', 'Afro House', 'Semba', 'Kizomba', 'Zouk'];

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '963008') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setShowMenu(false);
      setPasswordInput('');
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

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
      setSongs(prev => prev.map(s => s.id === song.id ? { ...s, plays: (s.plays || 0) + 1 } : s));
    }
  }, [currentSong]);

  const trendingSongs = useMemo(() => {
    const manualFeatured = songs.filter(s => s.isFeatured);
    return manualFeatured.length > 0 ? manualFeatured : [...songs].sort((a, b) => b.plays - a.plays).slice(0, 6);
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase())
    ).reverse();
  }, [songs, searchQuery]);

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
      className="min-h-screen pb-40 text-slate-50 flex flex-col font-sans transition-colors duration-700"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* HEADER */}
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
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
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

      {/* MENU LATERAL */}
      {showMenu && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
          <div className="relative w-80 h-full bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <span className="font-black uppercase tracking-widest text-xs text-slate-500">Menu Navegação</span>
              <button onClick={() => setShowMenu(false)} className="text-white hover:rotate-90 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
              </button>
            </div>
            <nav className="space-y-6">
              <button onClick={() => { setSearchQuery(''); setShowMenu(false); }} className="block w-full text-left text-2xl font-black text-white hover:text-amber-500 transition-colors uppercase italic">Início</button>
              <button onClick={() => { setShowMenu(false); }} className="block w-full text-left text-2xl font-black text-white hover:text-amber-500 transition-colors uppercase italic">Explorar</button>
              <button onClick={() => { setShowLoginModal(true); setShowMenu(false); }} className="block w-full text-left text-2xl font-black text-white hover:text-amber-500 transition-colors uppercase italic">Administração</button>
            </nav>
            <div className="mt-auto border-t border-white/5 pt-8">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Siga-nos</p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white" style={{ color: settings.accentColor }}>Insta</div>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white" style={{ color: settings.accentColor }}>FB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: settings.accentColor }} />
            <h3 className="text-lg font-black mb-8 text-center tracking-widest uppercase text-white/50">Acesso Restrito</h3>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input 
                type="password" placeholder="SENHA" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center tracking-[0.5em] font-black text-2xl text-white"
              />
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase text-center">Senha Incorreta</p>}
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-amber-500 transition-all">Entrar</button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="w-full text-slate-500 text-[10px] font-black uppercase">Voltar</button>
            </form>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-grow">
        <section className="mb-12 rounded-[2.5rem] overflow-hidden relative min-h-[300px] md:min-h-[400px] flex items-end p-6 md:p-12 shadow-2xl border border-white/5">
          <img src={settings.heroImageUrl} alt="Hero" className="absolute inset-0 object-cover w-full h-full brightness-[0.3]" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-6xl font-black text-white mb-6 leading-[0.9] tracking-tighter">{settings.heroTitle}</h2>
            <p className="text-slate-300 text-base md:text-xl mb-8 max-w-xl font-medium leading-relaxed">{settings.heroSubtitle}</p>
          </div>
        </section>

        {/* DESTAQUES */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: settings.accentColor }} />
            <h3 className="text-2xl font-black tracking-tight uppercase text-white">Mais Quentes</h3>
          </div>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x no-scrollbar">
            {trendingSongs.map((song) => (
              <div key={song.id} id={`song-card-${song.id}`} className="min-w-[240px] md:min-w-[320px] snap-start">
                <MusicCard 
                  song={song}
                  onPlay={handlePlaySong}
                  onDownload={() => handleDownload(song)}
                  onLike={() => setSongs(prev => prev.map(s => s.id === song.id ? { ...s, likes: s.likes + 1 } : s))}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying && currentSong?.id === song.id}
                  isFeatured
                />
              </div>
            ))}
          </div>
        </section>

        {/* FILTROS GÊNEROS */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSearchQuery(cat === 'Todos' ? '' : cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) 
                ? 'text-black shadow-lg' : 'bg-slate-900/50 text-slate-500 border border-white/5 hover:text-white'
              }`}
              style={{ backgroundColor: (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) ? settings.accentColor : undefined }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRADE DE MÚSICAS */}
        <section className="mb-20">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {filteredSongs.map(song => (
              <div key={song.id} id={`song-card-${song.id}`}>
                <MusicCard 
                  song={song} 
                  onPlay={handlePlaySong}
                  onDownload={() => handleDownload(song)}
                  onLike={() => setSongs(prev => prev.map(s => s.id === song.id ? { ...s, likes: s.likes + 1 } : s))}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying && currentSong?.id === song.id}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER COM REDES SOCIAIS */}
      <footer className="py-20 border-t border-white/5 bg-black/20 flex flex-col items-center gap-10">
        <div className="flex items-center gap-4">
          <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:scale-110 transition-transform group">
            <svg className="w-6 h-6 text-slate-500 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24" style={{ color: settings.accentColor }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:scale-110 transition-transform group">
            <svg className="w-6 h-6 text-slate-500 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24" style={{ color: settings.accentColor }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:scale-110 transition-transform group">
             <svg className="w-6 h-6 text-slate-500 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24" style={{ color: settings.accentColor }}><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          </a>
        </div>
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex flex-col items-center gap-2">
          <span>{settings.footerText}</span>
          <span className="opacity-30">© {new Date().getFullYear()} {settings.siteName}</span>
        </div>
      </footer>

      <Player 
        song={currentSong} 
        isPlaying={isPlaying} 
        onTogglePlay={() => setIsPlaying(!isPlaying)} 
        onNext={() => {}} 
        onPrev={() => {}} 
        onDownload={currentSong ? () => handleDownload(currentSong) : undefined} 
      />
    </div>
  );
};

export default App;
