
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MOCK_SONGS } from './constants';
import { Song, SiteSettings } from './types';
import MusicCard from './components/MusicCard';
import Player from './components/Player';
import AdminArea from './components/AdminArea';

const INITIAL_SETTINGS: SiteSettings = {
  siteName: "Anoni Muzik",
  logoUrl: "https://blogger.googleusercontent.com/img/a/AVvXsEg4m1BP6dtAZ8t2E9jAQPFoupOT63PbtaYGC0u0g9nxtCrmeSqDsAvt_7xbM_ERqkWelyfpcgYtnamzhOGYRNhISzdkl_wwJazDqiXDY_4iOxAvrFpw7BjvJ1easxS70d8uOtst7Q4d0dAgtrVhgRRydpHWDaVcCj5OoYmVGN2IIfEJ-xyACFJRsngoXoE=s358", 
  heroTitle: "A maior montra da música nacional.",
  heroSubtitle: "Distribuição anônima e gratuita. Os ritmos que movem a nossa terra em um só lugar.",
  heroImageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
  accentColor: "#f59e0b",
  backgroundColor: "#020617",
  footerText: "site created por Hamilton Almeida Domingos"
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

  const top10Songs = useMemo(() => {
    return [...songs].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 10);
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
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white/5">
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
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
              <span className="font-black uppercase tracking-widest text-xs text-slate-500">Categorias de Ritmo</span>
              <button onClick={() => setShowMenu(false)} className="text-white hover:rotate-90 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
              </button>
            </div>
            <nav className="space-y-4">
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => { setSearchQuery(cat === 'Todos' ? '' : cat); setShowMenu(false); }} 
                  className="block w-full text-left text-xl font-black text-white hover:text-amber-500 transition-colors uppercase italic py-2 border-b border-white/5"
                >
                  {cat}
                </button>
              ))}
              <button 
                onClick={() => { setShowMenu(false); setShowLoginModal(true); }}
                className="block w-full text-left text-xl font-black text-white/5 hover:text-white/20 transition-colors uppercase italic py-2 mt-4"
              >
                HD
              </button>
            </nav>
            <div className="mt-auto border-t border-white/5 pt-8">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Siga o Movimento</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white" style={{ color: settings.accentColor }}>IG</div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white" style={{ color: settings.accentColor }}>YT</div>
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
            <h3 className="text-lg font-black mb-8 text-center tracking-widest uppercase text-white/50">Área Reservada</h3>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input 
                type="password" placeholder="SENHA" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center tracking-[0.5em] font-black text-2xl text-white"
              />
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase text-center">Acesso Negado</p>}
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-amber-500 transition-all">Validar</button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="w-full text-slate-500 text-[10px] font-black uppercase">Fechar</button>
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

        {/* TOP 10 RANKING */}
        <section className="mb-16 bg-slate-900/30 p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 rounded-full bg-amber-500" />
            <h3 className="text-2xl font-black tracking-tight uppercase text-white">Top 10</h3>
          </div>
          <div className="flex flex-col gap-3">
            {top10Songs.map((song, idx) => (
              <div 
                key={song.id} 
                onClick={() => handlePlaySong(song)}
                className="flex items-center gap-4 bg-black/20 hover:bg-white/5 p-4 rounded-2xl border border-white/5 cursor-pointer transition-all group"
              >
                <span className={`w-8 text-center text-2xl font-black italic ${idx < 3 ? 'text-amber-500' : 'text-slate-600'}`}>{idx + 1}</span>
                <img src={song.coverUrl} alt="" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-black text-white uppercase truncate">{song.title}</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{song.artist}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                   <div className="hidden md:block">
                     <span className="text-[10px] font-black text-amber-500 uppercase">{song.plays} Plays</span>
                   </div>
                   <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-black transition-all">
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GRADE DE TODAS AS MÚSICAS */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: settings.accentColor }} />
            <h3 className="text-2xl font-black tracking-tight uppercase text-white">Lançamentos</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
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

        {/* SOCIAL WINDOWS */}
        <section className="mb-20 space-y-12">
          {/* YOUTUBE WINDOW */}
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 bg-red-600 flex items-center gap-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <h3 className="font-black uppercase tracking-widest text-white text-sm">YouTube Channel</h3>
            </div>
            <div className="aspect-video w-full">
              <iframe 
                src="https://www.youtube.com/embed?listType=user_uploads&list=anonimuzik96" 
                className="w-full h-full border-none" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* FACEBOOK WINDOW */}
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 bg-[#1877F2] flex items-center gap-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <h3 className="font-black uppercase tracking-widest text-white text-sm">Facebook Page</h3>
            </div>
            <div className="w-full h-[500px]">
              <iframe 
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FAnonimuzik&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
                width="100%" 
                height="500" 
                style={{ border: 'none', overflow: 'hidden' }} 
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 bg-black/20 flex flex-col items-center gap-10">
        <div className="flex items-center gap-4">
          <a href="https://www.facebook.com/Anonimuzik" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:scale-110 transition-transform group">
            <svg className="w-6 h-6 text-slate-500 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24" style={{ color: settings.accentColor }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://youtube.com/@anonimuzik96" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:scale-110 transition-transform group">
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
