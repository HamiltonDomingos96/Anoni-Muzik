
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
    title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, likes: 0, isFeatured: false
  });

  const getSongPermalink = (id: string) => {
    return `${window.location.origin}${window.location.pathname}#song=${id}`;
  };

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

  const handleUniversalShare = async (song: Song) => {
    const permalink = getSongPermalink(song.id);
    const shareData = {
      title: song.title,
      text: `Ouve agora: ${song.title} - ${song.artist} no ${settings.siteName}!`,
      url: permalink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      copyPermalink(song.id);
    }
  };

  const copyPermalink = (id: string) => {
    navigator.clipboard.writeText(getSongPermalink(id));
    alert('Link da música copiado!');
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
        plays: newSong.plays || 0,
        downloads: newSong.downloads || 0,
        likes: newSong.likes || 0,
        isFeatured: newSong.isFeatured || false
      };
      setSongs([songToAdd, ...songs]);
    }
    setNewSong({ title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, likes: 0, isFeatured: false });
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
    setNewSong({ title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, likes: 0, isFeatured: false });
  };

  const removeSong = (id: string) => {
    if (confirm('Deseja eliminar permanentemente esta faixa? Esta ação não pode ser desfeita.')) {
      setSongs(songs.filter(s => s.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const updateMetric = (id: string, field: 'plays' | 'downloads' | 'likes', newValue: number) => {
    setSongs(songs.map(s => s.id === id ? { ...s, [field]: Math.max(0, newValue) } : s));
  };

  const stats = useMemo(() => {
    const totalPlays = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
    const totalDownloads = songs.reduce((acc, s) => acc + (s.downloads || 0), 0);
    const totalLikes = songs.reduce((acc, s) => acc + (s.likes || 0), 0);
    const multiplier = analyticsTimeframe === 'weekly' ? 7 : (analyticsTimeframe === 'monthly' ? 30 : 1);
    
    return { 
      totalPlays: totalPlays * multiplier, 
      totalDownloads: totalDownloads * multiplier, 
      totalLikes: totalLikes * multiplier 
    };
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
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Plays (Iniciais)</label>
                  <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" value={newSong.plays} onChange={e => setNewSong({...newSong, plays: parseInt(e.target.value) || 0})} />
                </div>
                <div className="md:col-span-1 space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500">Likes (Iniciais)</label>
                   <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" value={newSong.likes} onChange={e => setNewSong({...newSong, likes: parseInt(e.target.value) || 0})} />
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase border-b border-white/5">
                      <tr>
                        <th className="p-6">TRACK</th>
                        <th className="p-6 text-center">FEATURED</th>
                        <th className="p-6 text-center">PLAYS</th>
                        <th className="p-6 text-center">DWNLDS</th>
                        <th className="p-6 text-center">LIKES</th>
                        <th className="p-6 text-right">MGMT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {songs.map(song => (
                        <tr key={song.id} className="hover:bg-white/[0.02]">
                          <td className="p-6 flex items-center gap-4">
                            <img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="truncate">
                              <div className="font-bold text-white">{song.title}</div>
                              <div className="text-[9px] text-slate-500 font-mono mt-1">{getSongPermalink(song.id)}</div>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <button onClick={() => toggleFeatured(song.id)} className={`p-2 transition-all ${song.isFeatured ? 'text-amber-500 scale-110' : 'text-slate-800'}`}>
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            </button>
                          </td>
                          <td className="p-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-amber-500 font-bold">{song.plays}</span>
                              <div className="flex gap-1">
                                <button onClick={() => updateMetric(song.id, 'plays', song.plays - 1)} className="text-[10px] bg-white/5 p-1 rounded hover:bg-amber-500/20 px-2">-</button>
                                <button onClick={() => updateMetric(song.id, 'plays', song.plays + 1)} className="text-[10px] bg-white/5 p-1 rounded hover:bg-amber-500/20 px-2">+</button>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-slate-300 font-bold">{song.downloads}</span>
                              <div className="flex gap-1">
                                <button onClick={() => updateMetric(song.id, 'downloads', song.downloads - 1)} className="text-[10px] bg-white/5 p-1 rounded hover:bg-white/10 px-2">-</button>
                                <button onClick={() => updateMetric(song.id, 'downloads', song.downloads + 1)} className="text-[10px] bg-white/5 p-1 rounded hover:bg-white/10 px-2">+</button>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-red-500 font-bold">{song.likes}</span>
                              <div className="flex gap-1">
                                <button onClick={() => updateMetric(song.id, 'likes', song.likes - 1)} className="text-[10px] bg-white/5 p-1 rounded hover:bg-red-500/20 px-2">-</button>
                                <button onClick={() => updateMetric(song.id, 'likes', song.likes + 1)} className="text-[10px] bg-white/5 p-1 rounded hover:bg-red-500/20 px-2">+</button>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button 
                                onClick={() => copyPermalink(song.id)} 
                                className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                                title="Copiar Link"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                              </button>
                              <button 
                                onClick={() => handleUniversalShare(song)} 
                                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all transform hover:scale-110"
                                title="Partilhar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                              </button>
                              <button onClick={() => handleEditClick(song)} className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-blue-500/20 hover:text-blue-400 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                              <button onClick={() => removeSong(song.id)} className="w-9 h-9 rounded-xl bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-10">
            <div className="flex justify-center mb-8"><div className="bg-slate-900 p-1 rounded-2xl flex border border-white/5">{['daily', 'weekly', 'monthly'].map(tf => <button key={tf} onClick={() => setAnalyticsTimeframe(tf as any)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${analyticsTimeframe === tf ? 'bg-white text-black' : 'text-slate-500 hover:text-slate-300'}`}>{tf}</button>)}</div></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl"><p className="text-slate-500 text-[9px] font-black uppercase mb-4">Plays ({analyticsTimeframe})</p><div className="text-4xl font-black text-amber-500">{stats.totalPlays.toLocaleString()}</div></div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl"><p className="text-slate-500 text-[9px] font-black uppercase mb-4">Downloads ({analyticsTimeframe})</p><div className="text-4xl font-black text-white">{stats.totalDownloads.toLocaleString()}</div></div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl"><p className="text-slate-500 text-[9px] font-black uppercase mb-4">Ameis ({analyticsTimeframe})</p><div className="text-4xl font-black text-red-500">{stats.totalLikes.toLocaleString()}</div></div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl"><p className="text-slate-500 text-[9px] font-black uppercase mb-4">Total Músicas</p><div className="text-4xl font-black text-slate-400">{songs.length}</div></div>
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
