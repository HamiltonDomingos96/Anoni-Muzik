
import React, { useState, useCallback } from 'react';
import { MOCK_SONGS } from './constants';
import { Song } from './types';
import MusicCard from './components/MusicCard';
import Player from './components/Player';

const App: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePlaySong = useCallback((song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  }, [currentSong]);

  const handleNext = useCallback(() => {
    if (!currentSong) return;
    const currentIndex = MOCK_SONGS.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % MOCK_SONGS.length;
    setCurrentSong(MOCK_SONGS[nextIndex]);
    setIsPlaying(true);
  }, [currentSong]);

  const handlePrev = useCallback(() => {
    if (!currentSong) return;
    const currentIndex = MOCK_SONGS.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + MOCK_SONGS.length) % MOCK_SONGS.length;
    setCurrentSong(MOCK_SONGS[prevIndex]);
    setIsPlaying(true);
  }, [currentSong]);

  const filteredSongs = MOCK_SONGS.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Anoni Muzik
            </h1>
          </div>
          
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Buscar músicas, artistas ou gêneros..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 px-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
             <button className="text-sm font-medium hover:text-indigo-400 transition-colors">Upgrade</button>
             <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-colors">Entrar</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <section className="mb-12 rounded-3xl overflow-hidden relative h-64 md:h-80 flex items-center p-8 md:p-12">
          <img 
            src="https://picsum.photos/seed/abstract/1200/400" 
            alt="Hero" 
            className="absolute inset-0 object-cover w-full h-full brightness-50"
          />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              A música sem fronteiras. <br/><span className="text-indigo-400">Totalmente anônima.</span>
            </h2>
            <p className="text-slate-200 text-lg mb-6">
              Descubra novos sons, publique suas batidas e baixe o que quiser sem limites.
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-600/30 transition-all">
              Publicar Minha Música
            </button>
          </div>
        </section>

        {/* Categories / Filters */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['Todos', 'Synthwave', 'Hip Hop', 'Acoustic', 'Electronic', 'Ambient'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setSearchQuery(cat === 'Todos' ? '' : cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                (searchQuery === cat || (cat === 'Todos' && searchQuery === '')) 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Music Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Músicas em Destaque'}
            </h3>
            <span className="text-slate-400 text-sm">{filteredSongs.length} músicas encontradas</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredSongs.length > 0 ? (
              filteredSongs.map(song => (
                <MusicCard 
                  key={song.id} 
                  song={song} 
                  onPlay={handlePlaySong}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying && currentSong?.id === song.id}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="bg-slate-800/50 rounded-2xl p-12 inline-block">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-400 font-medium">Nenhuma música encontrada com esse termo.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Music Player */}
      <Player 
        song={currentSong}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
};

export default App;
