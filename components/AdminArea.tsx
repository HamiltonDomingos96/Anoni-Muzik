
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
  const [activeTab, setActiveTab] = useState<'songs' | 'settings' | 'analytics' | 'ranking'>('songs');
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
      navigator.clipboard.writeText(permalink);
      alert('Link da música copiado!');
    }
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

  const cancelEdit = () => {
    setEditingId(null);
    setNewSong({ title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, likes: 0, isFeatured: false });
  };

  const removeSong = (id: string) => {
    if (window.confirm('Deseja eliminar permanentemente esta faixa?')) {
      setSongs(prev => prev.filter(s => s.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const toggleFeatured = (id: string) => {
    setSongs(songs.map(s => s.id === id ? { ...s, isFeatured: !s.isFeatured } : s));
  };

  const updateMetric = (id: string, field: 'plays' | 'downloads' | 'likes', newValue: number) => {
    setSongs(prevSongs => prevSongs.map(s => s.id === id ? { ...s, [field]: Math.max(0, newValue) } : s));
  };

  const siteStats = useMemo(() => {
    const totalPlays = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
    const totalDownloads = songs.reduce((acc, s) => acc + (s.downloads || 0), 0);
    const totalLikes = songs.reduce((acc, s) => acc + (s.likes || 0), 0);
    const multiplier = analyticsTimeframe === 'weekly' ? 7 : (analyticsTimeframe === 'monthly' ? 30 : 1);
    return { 
      totalPlays: Math.round(totalPlays * multiplier), 
      totalDownloads: Math.round(totalDownloads * multiplier), 
      totalLikes: Math.round(totalLikes * multiplier),
      realTotalPlays: totalPlays,
      realTotalDownloads: totalDownloads,
      realTotalLikes: totalLikes
    };
  }, [songs, analyticsTimeframe]);

  const rankingData = useMemo(() => {
    return [...songs].sort((a, b) => {
      const scoreA = (a.plays * 1) + (a.downloads * 2) + (a.likes * 3);
      const scoreB = (b.plays * 1) + (b.downloads * 2) + (b.likes * 3);
      return scoreB - scoreA;
    });
  }, [songs]);

  const maxScore = useMemo(() => {
    if (rankingData.length === 0) return 1;
    const top = rankingData[0];
    return (top.plays * 1) + (top.downloads * 2) + (top.likes * 3);
  }, [rankingData]);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center">
              <span className="font-black text-black text-xs">HD</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">CORE CMS</h2>
          </div>
          <nav className="flex bg-black/40 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {['songs', 'ranking', 'analytics', 'settings'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)} 
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                {tab === 'songs' ? 'Músicas' : tab === 'ranking' ? 'Ranking' : tab === 'analytics' ? 'Estatística' : 'Template'}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{siteStats.realTotalPlays} PLAYS GLOBAIS</span>
            <span className="hidden md:block text-[9px] font-black uppercase tracking-widest text-slate-600">Admin: Hamilton Almeida Domingos</span>
          </div>
          <button onClick={onClose} className="bg-slate-800 hover:bg-white hover:text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Sair</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 max-w-7xl mx-auto w-full">
        {activeTab === 'ranking' ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Progresso de Lançamentos</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Ranking baseado em score de engajamento (Plays, Downloads e Likes)</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Líder: </span>
                 <span className="text-sm font-mono font-black text-amber-500">{maxScore.toLocaleString()} pts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {rankingData.map((song, idx) => {
                const currentScore = (song.plays * 1) + (song.downloads * 2) + (song.likes * 3);
                const progressWidth = (currentScore / maxScore) * 100;
                
                return (
                  <div key={song.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-8 group hover:bg-slate-900 transition-all">
                    <div className="w-8 md:w-12 text-center">
                      <span className={`text-xl md:text-2xl font-black ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-700' : 'text-slate-700'}`}>
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <img src={song.coverUrl} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shadow-2xl" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <div>
                          <h4 className="font-black text-white uppercase text-sm md:text-base truncate tracking-tight">{song.title}</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{song.artist}</p>
                        </div>
                      </div>
                      <div className="relative h-2 bg-black/40 rounded-full overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-slate-600'}`} style={{ width: `${progressWidth}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'songs' ? (
          <div className="space-y-12">
            <section className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${editingId ? 'bg-blue-500' : 'bg-amber-500'}`} />
              <h3 className={`text-xl font-black mb-6 uppercase tracking-tight ${editingId ? 'text-blue-400' : 'text-amber-500'}`}>
                {editingId ? 'Alterar Informações da Música' : 'Novo Lançamento'}
              </h3>
              <form onSubmit={handleSubmitSong} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:row-span-2 flex flex-col items-center justify-center space-y-3">
                  <div onClick={triggerFileUpload} className="w-full aspect-square bg-black border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer group hover:border-amber-500/50 transition-all overflow-hidden relative">
                    {newSong.coverUrl ? (
                      <img src={newSong.coverUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <span className="text-[10px] font-black uppercase text-slate-600">Capa da Track</span>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Título</label>
                  <input type="text" placeholder="Título" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm text-white" value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Artista</label>
                  <input type="text" placeholder="Artista" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm text-white" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Gênero</label>
                  <select className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 appearance-none text-sm text-white" value={newSong.genre} onChange={e => setNewSong({...newSong, genre: e.target.value})}>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">URL Áudio</label>
                  <input type="text" placeholder="URL .mp3" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm text-white" value={newSong.audioUrl} onChange={e => setNewSong({...newSong, audioUrl: e.target.value})} />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Plays</label>
                  <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm text-white" value={newSong.plays} onChange={e => setNewSong({...newSong, plays: parseInt(e.target.value) || 0})} />
                </div>
                <div className="md:col-span-1 space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500">Likes</label>
                   <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm text-white" value={newSong.likes} onChange={e => setNewSong({...newSong, likes: parseInt(e.target.value) || 0})} />
                </div>
                <div className="md:col-span-3 flex justify-end items-center gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newSong.isFeatured} onChange={e => setNewSong({...newSong, isFeatured: e.target.checked})} className="w-5 h-5 rounded-lg bg-black border-white/10 text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Destaque</span>
                  </label>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="bg-slate-800 text-white font-black py-4 px-12 rounded-2xl uppercase text-xs">Cancelar</button>
                  )}
                  <button type="submit" className={`${editingId ? 'bg-blue-600' : 'bg-amber-500'} text-black font-black py-4 px-12 rounded-2xl uppercase text-xs shadow-xl`}>
                    {editingId ? 'Atualizar Track' : 'Publicar Track'}
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase border-b border-white/5">
                    <tr>
                      <th className="p-6">TRACK</th>
                      <th className="p-6 text-center">FEATURED</th>
                      <th className="p-6 text-center">PLAYS</th>
                      <th className="p-6 text-center">LIKES</th>
                      <th className="p-6 text-right">MGMT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {songs.map(song => (
                      <tr key={song.id} className="hover:bg-white/[0.02]">
                        <td className="p-6 flex items-center gap-4">
                          <img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <div className="font-bold text-white truncate max-w-[150px]">{song.title}</div>
                            <div className="text-[9px] text-slate-500 font-mono mt-1">{song.artist}</div>
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
                            <span className="font-mono text-red-500 font-bold">{song.likes}</span>
                            <div className="flex gap-1">
                              <button onClick={() => updateMetric(song.id, 'likes', song.likes - 1)} className="text-[10px] bg-white/5 p-1 rounded hover:bg-red-500/20 px-2">-</button>
                              <button onClick={() => updateMetric(song.id, 'likes', song.likes + 1)} className="text-[10px] bg-white/5 p-1 rounded hover:bg-red-500/20 px-2">+</button>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleUniversalShare(song)} className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white" title="Partilhar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
                             <button onClick={() => handleEditClick(song)} className="w-9 h-9 rounded-xl bg-blue-900/20 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all" title="Editar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                             <button onClick={() => removeSong(song.id)} className="w-9 h-9 rounded-xl bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all" title="Eliminar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl group">
                <p className="text-slate-500 text-[9px] font-black uppercase mb-4 tracking-widest">Plays Totais</p>
                <div className="text-4xl font-black text-amber-500">{siteStats.realTotalPlays.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[9px] font-black uppercase mb-4 tracking-widest">Favoritos</p>
                <div className="text-4xl font-black text-red-500">{siteStats.realTotalLikes.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-500">
            <section className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
              <h3 className="text-xl font-black mb-8 uppercase text-amber-500">Template</h3>
              <div className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500">Nome Site</label><input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500">Rodapé</label><input type="text" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" /></div>
              </div>
            </section>
          </div>
        )}
      </main>
      <footer className="p-10 border-t border-white/5 bg-black flex flex-col items-center gap-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Anoni Muzik CMS • Hamilton Almeida Domingos</p>
      </footer>
    </div>
  );
};

export default AdminArea;
