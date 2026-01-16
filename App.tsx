
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
  footerText: "site criado por Hamilton Almeida Domingos"
};

const CATEGORIES = ['Todos', 'Rap', 'Kuduro', 'Afro House', 'Semba', 'Kizomba', 'Zouk'];
const PERFORMANCE_FILTERS = ['Recentes', 'Mais Ouvidas', 'Mais Baixadas'];

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
    localStorage.setItem('anoni_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('anoni_settings', JSON.stringify(settings));
  }, [settings]);

  const incrementPlay = useCallback((songId: string) => {
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, plays: (s.plays || 0) + 1 } : s));
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
    // Show manual featured songs first, fallback to top played if none are marked
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
    <div className="min-h-screen pb-40 bg-slate-950 text-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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

      {/* Lateral Menu Overlay */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setShowMenu(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Navegação</h2>
              <button onClick={() => setShowMenu(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar space-y-6">
              {/* Categorias Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Categorias</p>
                <div className="grid grid-cols-1 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => { setSearchQuery(cat === 'Todos' ? '' : cat); setShowMenu(false); }}
                      className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group flex items-center justify-between"
                    >
                      <span className="font-bold text-xs uppercase tracking-widest">{cat}</span>
                      <svg className="w-4 h-4 text-slate-600 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* General Actions */}
              <div className="space-y-3 pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sistema</p>
                
                <button 
                  onClick={() => { setShowAbout(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">Sobre Nós</span>
                </button>

                <a 
                  href="https://wa.me/244948352425" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.14l-.904 3.316 3.403-.89c.836.457 1.706.7 2.244.7h.005c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766z" /></svg>
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">Apoio WhatsApp</span>
                </a>

                <button 
                  onClick={() => { setShowLoginModal(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <span className="font-black text-[10px]">HD</span>
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">HD</span>
                </button>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 text-center">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Desenvolvido por</p>
              <p className="text-xs font-black text-white uppercase tracking-widest italic">Hamilton Almeida Domingos</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-grow">
        {/* Mobile Search */}
        <div className="md:hidden mb-8 relative group">
          <input 
            type="text" 
            placeholder="Pesquisar batidas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Hero Section */}
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

        {/* Featured Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-amber-500 rounded-full" />
            <h3 className="text-2xl font-black tracking-tight uppercase">Em Destaque (Hot)</h3>
          </div>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x scroll-smooth no-scrollbar">
            {trendingSongs.map((song) => (
              <div key={song.id} className="min-w-[240px] md:min-w-[320px] snap-start">
                <MusicCard 
                  song={song}
                  onPlay={handlePlaySong}
                  onDownload={() => handleDownload(song)}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying && currentSong?.id === song.id}
                  isFeatured
                />
              </div>
            ))}
          </div>
        </section>

        {/* Horizontal Filters (Kept for quick access) */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSearchQuery(cat === 'Todos' ? '' : cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'bg-slate-900 text-slate-500 border border-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
          {PERFORMANCE_FILTERS.map((filter) => (
            <button 
              key={filter}
              onClick={() => setPerformanceFilter(filter)}
              className={`whitespace-nowrap px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${
                performanceFilter === filter 
                ? 'border-white text-white' 
                : 'border-transparent text-slate-600 hover:text-slate-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid Section */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-xl font-black text-white tracking-tight uppercase">
              {searchQuery ? `${searchQuery}` : 'Catálogo Completo'}
            </h3>
            <span className="text-slate-600 text-[10px] font-black font-mono uppercase tracking-widest">{filteredAndSortedSongs.length} TRACKS</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {filteredAndSortedSongs.map(song => (
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
          {filteredAndSortedSongs.length === 0 && (
            <div className="py-24 text-center bg-slate-900/20 rounded-[2rem] border border-dashed border-white/10">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhum lançamento nesta categoria.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 opacity-50 grayscale">
          <div className="w-8 h-8 rounded-lg bg-slate-800" />
          <span className="text-sm font-black tracking-tighter uppercase italic">{settings.siteName}</span>
        </div>
        <div className="text-slate-700 text-[9px] font-black tracking-[0.4em] uppercase">Private Distribution Network</div>
        <div className="text-slate-800 text-[10px] font-bold uppercase tracking-widest pt-4">
          {settings.footerText}
        </div>
      </footer>

      {/* About Us Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl p-6">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
             <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-black tracking-tighter uppercase italic">Sobre {settings.siteName}</h3>
               <button onClick={() => setShowAbout(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-500 hover:text-white">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="space-y-6 text-slate-300 leading-relaxed font-medium">
               <p>
                 A <span className="text-white font-bold">{settings.siteName}</span> é a maior plataforma de distribuição musical dedicada à preservação e promoção dos ritmos nacionais angolanos. 
                 Nascemos com a missão de conectar artistas talentosos diretamente com o seu público, sem intermediários desnecessários.
               </p>
               <p>
                 Especializados em gêneros como Rap, Kuduro, Afro House, Semba, Kizomba e Zouk, oferecemos um espaço de alta fidelidade para o streaming e download gratuito de música de qualidade superior.
               </p>
               <div className="pt-8 mt-4 border-t border-white/5">
                 <p className="text-amber-500 font-black uppercase text-[10px] tracking-[0.3em] mb-2">Créditos de Desenvolvimento</p>
                 <p className="text-lg font-black text-white uppercase italic tracking-tighter">Hamilton Almeida Domingos</p>
                 <p className="text-[10px] mt-1 text-slate-500 font-bold uppercase tracking-widest">Lead Engineer & Architect</p>
               </div>
               <button 
                 onClick={() => setShowAbout(false)}
                 className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest mt-8 hover:bg-amber-500 transition-all shadow-xl"
               >
                 Fechar
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Discreet Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl p-4">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <h3 className="text-lg font-black mb-8 text-center tracking-widest uppercase text-white/50">Terminal Access</h3>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input 
                type="password"
                placeholder="TOKEN"
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full bg-black/40 border ${loginError ? 'border-red-500' : 'border-white/10'} p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center tracking-[0.5em] font-black text-2xl placeholder:tracking-normal placeholder:text-slate-800`}
              />
              <div className="flex flex-col gap-3">
                <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-amber-500 transition-all shadow-lg">Authenticate</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="w-full py-2 text-slate-600 font-bold text-[9px] uppercase hover:text-white transition-colors">Abort</button>
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
