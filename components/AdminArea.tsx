
import React, { useState, useMemo, useRef } from 'react';
import { Song, SiteSettings } from '../types';

interface AdminAreaProps {
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onClose: () => void;
}

const GENRES = ['Rap', 'Kuduro', 'Afro House', 'Semba', 'Kizomba', 'Zouk'];

const AdminArea: React.FC<AdminAreaProps> = ({ songs, setSongs, settings, setSettings, onClose }) => {
  const [activeTab, setActiveTab] = useState<'songs' | 'settings' | 'analytics'>('songs');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, isFeatured: false
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSong({ ...newSong, coverUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const shareOnFacebook = (song: Song) => {
    // Note: In a real app, this would be the actual song URL. 
    // Since this is a SPA, we use the site URL or a placeholder.
    const shareUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Ouve agora: ${song.title} - ${song.artist} no ${settings.siteName}!`);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${text}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=400');
  };

  const handleSubmitSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.audioUrl) return;

    if (editingId) {
      setSongs(songs.map(s => s.id === editingId ? { ...s, ...newSong as Song } : s));
      setEditingId(null);
    } else {
      const songToAdd: Song = {
        ...newSong as Song,
        id: Date.now().toString(),
        plays: 0,
        downloads: 0,
        isFeatured: newSong.isFeatured || false
      };
      setSongs([songToAdd, ...songs]);
    }
    setNewSong({ title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, isFeatured: false });
  };

  const handleEditClick = (song: Song) => {
    setEditingId(song.id);
    setNewSong(song);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFeatured = (id: string) => {
    setSongs(songs.map(s => s.id === id ? { ...s, isFeatured: !s.isFeatured } : s));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewSong({ title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, isFeatured: false });
  };

  const removeSong = (id: string) => {
    if (confirm('Deseja eliminar permanentemente esta faixa? Esta ação não pode ser desfeita.')) {
      setSongs(songs.filter(s => s.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const resetStats = (id: string) => {
    setSongs(songs.map(s => s.id === id ? { ...s, plays: 0, downloads: 0 } : s));
  };

  const stats = useMemo(() => {
    const totalPlays = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
    const totalDownloads = songs.reduce((acc, s) => acc + (s.downloads || 0), 0);
    const multiplier = analyticsTimeframe === 'weekly' ? 7 : (analyticsTimeframe === 'monthly' ? 30 : 1);
    const displayPlays = totalPlays * multiplier;
    const displayDownloads = totalDownloads * multiplier;
    
    const genreData = GENRES.map(genre => {
      const genreSongs = songs.filter(s => s.genre === genre);
      const genrePlays = genreSongs.reduce((acc, s) => acc + (s.plays || 0), 0);
      return { 
        name: genre, 
        count: genreSongs.length, 
        plays: genrePlays * multiplier,
        percentage: totalPlays > 0 ? (genrePlays / totalPlays) * 100 : 0
      };
    }).sort((a, b) => b.plays - a.plays);

    const artistMap: Record<string, number> = {};
    songs.forEach(s => {
      artistMap[s.artist] = (artistMap[s.artist] || 0) + (s.plays || 0);
    });
    const topArtists = Object.entries(artistMap)
      .map(([name, plays]) => ({ name, plays: plays * multiplier }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    return { totalPlays: displayPlays, totalDownloads: displayDownloads, genreData, topArtists };
  }, [songs, analyticsTimeframe]);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center">
              <span className="font-black text-black text-xs">HD</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter">CORE CMS</h2>
          </div>
          <nav className="flex bg-black/40 p-1 rounded-xl">
            {['songs', 'analytics', 'settings'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)} 
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                {tab === 'songs' ? 'Músicas' : tab === 'analytics' ? 'Estatística' : 'Template'}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-[9px] font-black uppercase tracking-widest text-slate-600">Hamilton Almeida Domingos</span>
          <button onClick={onClose} className="bg-slate-800 hover:bg-white hover:text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Sair</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 max-w-7xl mx-auto w-full">
        {activeTab === 'songs' ? (
          <div className="space-y-12">
            <section className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${editingId ? 'bg-blue-500' : 'bg-amber-500'}`} />
              <h3 className={`text-xl font-black mb-6 uppercase tracking-tight ${editingId ? 'text-blue-400' : 'text-amber-500'}`}>
                {editingId ? 'Alterar Informações da Música' : 'Novo Lançamento'}
              </h3>
              <form onSubmit={handleSubmitSong} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:row-span-2 flex flex-col items-center justify-center space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 self-start">Capa da Música (Galeria)</label>
                  <div onClick={triggerFileUpload} className="w-full aspect-square bg-black border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer group hover:border-amber-500/50 transition-all overflow-hidden relative">
                    {newSong.coverUrl ? (
                      <>
                        <img src={newSong.coverUrl} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[10px] font-black uppercase text-white bg-black/50 px-4 py-2 rounded-full">Trocar Imagem</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-600 group-hover:text-amber-500 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[10px] font-black uppercase text-slate-600 group-hover:text-slate-300">Carregar da Galeria</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Título da Track</label>
                  <input type="text" placeholder="Ex: Zigue-Zague" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Artista / Grupo</label>
                  <input type="text" placeholder="Ex: Caudilho" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Gênero</label>
                  <select className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 appearance-none text-sm" value={newSong.genre} onChange={e => setNewSong({...newSong, genre: e.target.value})}>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">URL do MP3</label>
                  <input type="text" placeholder="https://..." className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" value={newSong.audioUrl} onChange={e => setNewSong({...newSong, audioUrl: e.target.value})} />
                </div>
                <div className="md:col-span-3 flex justify-end items-center gap-6 mt-4">
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="checkbox" checked={newSong.isFeatured} onChange={e => setNewSong({...newSong, isFeatured: e.target.checked})} className="w-5 h-5 rounded-lg bg-black border-white/10 text-amber-500 focus:ring-amber-500" />
                     <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-amber-500">Marcar como Destaque</span>
                   </label>
                  {editingId && <button type="button" onClick={cancelEdit} className="bg-slate-800 text-white font-black py-4 px-12 rounded-2xl uppercase text-xs hover:bg-slate-700">Cancelar</button>}
                  <button type="submit" className={`${editingId ? 'bg-blue-600' : 'bg-amber-500'} text-black font-black py-4 px-12 rounded-2xl uppercase text-xs hover:opacity-90 shadow-xl`}>
                    {editingId ? 'Guardar' : 'Publicar'}
                  </button>
                </div>
              </form>
            </section>
            <section>
              <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase border-b border-white/5">
                    <tr><th className="p-6">TRACK</th><th className="p-6 text-center">FEATURED</th><th className="p-6 text-center">PLAYS</th><th className="p-6 text-center">DWNLDS</th><th className="p-6 text-right">MGMT</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {songs.map(song => (
                      <tr key={song.id} className="hover:bg-white/[0.02]">
                        <td className="p-6 flex items-center gap-4"><img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover" /><div className="truncate"><div className="font-bold text-white">{song.title}</div><div className="text-xs text-slate-500">{song.artist}</div></div></td>
                        <td className="p-6 text-center"><button onClick={() => toggleFeatured(song.id)} className={`p-2 transition-all ${song.isFeatured ? 'text-amber-500 scale-110' : 'text-slate-800'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></button></td>
                        <td className="p-6 text-center font-mono text-amber-500 font-bold">{song.plays}</td>
                        <td className="p-6 text-center font-mono text-slate-300 font-bold">{song.downloads}</td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button 
                              onClick={() => shareOnFacebook(song)} 
                              className="w-8 h-8 rounded-lg bg-blue-900/20 text-blue-500 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                              title="Publicar no Facebook"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                              </svg>
                            </button>
                            <button onClick={() => handleEditClick(song)} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-500/20 hover:text-blue-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                            <button onClick={() => removeSong(song.id)} className="w-8 h-8 rounded-lg bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-10">
            <div className="flex justify-center mb-8"><div className="bg-slate-900 p-1 rounded-2xl flex border border-white/5">{['daily', 'weekly', 'monthly'].map(tf => <button key={tf} onClick={() => setAnalyticsTimeframe(tf as any)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${analyticsTimeframe === tf ? 'bg-white text-black' : 'text-slate-500 hover:text-slate-300'}`}>{tf}</button>)}</div></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl"><p className="text-slate-500 text-[9px] font-black uppercase mb-4">Plays ({analyticsTimeframe})</p><div className="text-4xl font-black text-amber-500">{stats.totalPlays.toLocaleString()}</div></div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl"><p className="text-slate-500 text-[9px] font-black uppercase mb-4">Downloads ({analyticsTimeframe})</p><div className="text-4xl font-black text-white">{stats.totalDownloads.toLocaleString()}</div></div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl"><p className="text-slate-500 text-[9px] font-black uppercase mb-4">Ativas</p><div className="text-4xl font-black text-slate-400">{songs.length}</div></div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl"><p className="text-slate-500 text-[9px] font-black uppercase mb-4">Conversão</p><div className="text-4xl font-black text-blue-500">{stats.totalPlays > 0 ? ((stats.totalDownloads / stats.totalPlays) * 100).toFixed(1) : 0}%</div></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
              <h3 className="text-xl font-black mb-8 uppercase text-amber-500">Identidade</h3>
              <div className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500">Nome Site</label><input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500">Rodapé</label><input type="text" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm" /></div>
              </div>
            </section>
          </div>
        )}
      </main>
      <footer className="p-10 border-t border-white/5 bg-black flex flex-col items-center gap-6">
        <div className="flex items-center gap-6">
          <a href="https://wa.me/244948352425" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-green-500 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.14l-.904 3.316 3.403-.89c.836.457 1.706.7 2.244.7h.005c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766z" /></svg></a>
          <a href="https://facebook.com/anonimuzik" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-500 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg></a>
          <a href="https://youtube.com/@anonimuzik" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></a>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">CORE CMS &copy; {new Date().getFullYear()} • Anoni Muzik Network</p>
      </footer>
    </div>
  );
};

export default AdminArea;
