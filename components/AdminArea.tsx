
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const songFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, likes: 0, isFeatured: false
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'song' | 'hero') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'song') {
          setNewSong({ ...newSong, coverUrl: reader.result as string });
        } else {
          setSettings({ ...settings, heroImageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.audioUrl) {
      alert("Título e URL de áudio são obrigatórios.");
      return;
    }

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

  const updateMetric = (id: string, field: 'plays' | 'downloads' | 'likes', newValue: number) => {
    setSongs(prevSongs => prevSongs.map(s => s.id === id ? { ...s, [field]: Math.max(0, newValue) } : s));
  };

  const siteStats = useMemo(() => {
    return {
      totalPlays: songs.reduce((acc, s) => acc + (s.plays || 0), 0),
      totalDownloads: songs.reduce((acc, s) => acc + (s.downloads || 0), 0),
      totalLikes: songs.reduce((acc, s) => acc + (s.likes || 0), 0)
    };
  }, [songs]);

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
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: settings.accentColor }}>
              <span className="font-black text-black text-xs">HD</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">CORE CMS</h2>
          </div>
          <nav className="flex bg-black/40 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {[
              { id: 'songs', label: 'Músicas' },
              { id: 'ranking', label: 'Ranking' },
              { id: 'analytics', label: 'Estatística' },
              { id: 'settings', label: 'Template' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                style={{ backgroundColor: activeTab === tab.id ? settings.accentColor : 'transparent' }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: settings.accentColor }}>{siteStats.totalPlays} PLAYS GLOBAIS</span>
            <span className="hidden md:block text-[9px] font-black uppercase tracking-widest text-slate-600">Admin: Hamilton Almeida Domingos</span>
          </div>
          <button onClick={onClose} className="bg-slate-800 hover:bg-white hover:text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Sair</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 max-w-7xl mx-auto w-full">
        {activeTab === 'songs' ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <section className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: editingId ? '#3b82f6' : settings.accentColor }} />
              <h3 className={`text-xl font-black mb-6 uppercase tracking-tight ${editingId ? 'text-blue-400' : ''}`} style={{ color: !editingId ? settings.accentColor : undefined }}>
                {editingId ? 'Modo de Edição Ativo' : 'Novo Lançamento'}
              </h3>
              <form onSubmit={handleSubmitSong} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:row-span-2 flex flex-col items-center justify-center space-y-3">
                  <div onClick={() => songFileInputRef.current?.click()} className="w-full aspect-square bg-black border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer group hover:border-amber-500/50 transition-all overflow-hidden relative">
                    {newSong.coverUrl ? (
                      <img src={newSong.coverUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="w-8 h-8 mx-auto text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[10px] font-black uppercase text-slate-600">Capa da Track</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={songFileInputRef} onChange={(e) => handleImageUpload(e, 'song')} accept="image/*" className="hidden" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Título</label>
                  <input type="text" placeholder="Título da música" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Artista</label>
                  <input type="text" placeholder="Nome do artista" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Gênero</label>
                  <select className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none appearance-none text-sm text-white" value={newSong.genre} onChange={e => setNewSong({...newSong, genre: e.target.value})}>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">URL Áudio (.mp3)</label>
                  <input type="text" placeholder="https://..." className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" value={newSong.audioUrl} onChange={e => setNewSong({...newSong, audioUrl: e.target.value})} />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Plays Iniciais</label>
                  <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" value={newSong.plays} onChange={e => setNewSong({...newSong, plays: parseInt(e.target.value) || 0})} />
                </div>
                <div className="md:col-span-1 space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500">Likes Iniciais</label>
                   <input type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" value={newSong.likes} onChange={e => setNewSong({...newSong, likes: parseInt(e.target.value) || 0})} />
                </div>
                <div className="md:col-span-3 flex justify-between items-center gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newSong.isFeatured} onChange={e => setNewSong({...newSong, isFeatured: e.target.checked})} className="w-5 h-5 rounded-lg bg-black border-white/10" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Destaque na Home</span>
                  </label>
                  <div className="flex gap-4">
                    {editingId && (
                      <button type="button" onClick={cancelEdit} className="bg-slate-800 text-white font-black py-4 px-8 rounded-2xl uppercase text-xs">Cancelar</button>
                    )}
                    <button type="submit" className="text-black font-black py-4 px-12 rounded-2xl uppercase text-xs shadow-xl transition-all active:scale-95" style={{ backgroundColor: editingId ? '#3b82f6' : settings.accentColor }}>
                      {editingId ? 'Salvar Alterações' : 'Publicar Agora'}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <section className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase border-b border-white/5">
                    <tr>
                      <th className="p-6">MÚSICA</th>
                      <th className="p-6 text-center">PLAYS</th>
                      <th className="p-6 text-center">DOWNLOADS</th>
                      <th className="p-6 text-center">LIKES</th>
                      <th className="p-6 text-right">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {songs.map(song => (
                      <tr key={song.id} className={`hover:bg-white/[0.02] transition-colors ${editingId === song.id ? 'bg-blue-500/5' : ''}`}>
                        <td className="p-6 flex items-center gap-4">
                          <img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                          <div>
                            <div className="font-bold text-white truncate max-w-[150px]">{song.title}</div>
                            <div className="text-[9px] text-slate-500 font-mono mt-1">{song.artist}</div>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono font-bold" style={{ color: settings.accentColor }}>{song.plays}</span>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <span className="font-mono text-white font-bold">{song.downloads}</span>
                        </td>
                        <td className="p-6 text-center">
                          <span className="font-mono text-red-500 font-bold">{song.likes}</span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleEditClick(song)} className="w-10 h-10 rounded-xl bg-blue-900/20 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                             </button>
                             <button onClick={() => removeSong(song.id)} className="w-10 h-10 rounded-xl bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : activeTab === 'ranking' ? (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Ranking de Engajamento</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {rankingData.map((song, idx) => {
                const currentScore = (song.plays * 1) + (song.downloads * 2) + (song.likes * 3);
                const progressWidth = (currentScore / maxScore) * 100;
                return (
                  <div key={song.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex items-center gap-8 group hover:bg-slate-900 transition-all">
                    <span className={`text-2xl font-black ${idx === 0 ? 'text-amber-500' : 'text-slate-700'}`}>#{idx + 1}</span>
                    <img src={song.coverUrl} className="w-16 h-16 rounded-xl object-cover shadow-2xl" alt="" />
                    <div className="flex-1">
                       <h4 className="font-black text-white uppercase text-base">{song.title}</h4>
                       <div className="relative h-2 bg-black/40 rounded-full mt-2 overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-amber-500" style={{ width: `${progressWidth}%` }} />
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
             <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Plays Totais</p>
                <div className="text-5xl font-black" style={{ color: settings.accentColor }}>{siteStats.totalPlays.toLocaleString()}</div>
             </div>
             <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Downloads</p>
                <div className="text-5xl font-black text-white">{siteStats.totalDownloads.toLocaleString()}</div>
             </div>
             <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Favoritos</p>
                <div className="text-5xl font-black text-red-500">{siteStats.totalLikes.toLocaleString()}</div>
             </div>
          </div>
        ) : (
          /* ABA TEMPLATE ATUALIZADA */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-500">
            <section className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-8">
              <h3 className="text-xl font-black mb-8 uppercase" style={{ color: settings.accentColor }}>Identidade e Textos</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Nome da Plataforma</label>
                  <input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Título de Impacto (Hero)</label>
                  <input type="text" value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Subtítulo (Hero)</label>
                  <textarea value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white h-24 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Texto do Rodapé</label>
                  <input type="text" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" />
                </div>
              </div>
            </section>

            <section className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-8">
              <h3 className="text-xl font-black mb-8 uppercase" style={{ color: settings.accentColor }}>Cores e Media</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500">Cor de Destaque (Accent)</label>
                    <div className="flex gap-3 items-center">
                       <input type="color" value={settings.accentColor} onChange={e => setSettings({...settings, accentColor: e.target.value})} className="w-12 h-12 rounded-lg bg-black border-none cursor-pointer" />
                       <span className="text-xs font-mono uppercase">{settings.accentColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500">Cor de Fundo (Background)</label>
                    <div className="flex gap-3 items-center">
                       <input type="color" value={settings.backgroundColor} onChange={e => setSettings({...settings, backgroundColor: e.target.value})} className="w-12 h-12 rounded-lg bg-black border-none cursor-pointer" />
                       <span className="text-xs font-mono uppercase">{settings.backgroundColor}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Imagem de Cartaz (Hero)</label>
                  <div 
                    onClick={() => heroFileInputRef.current?.click()}
                    className="w-full h-48 bg-black border-2 border-dashed border-white/10 rounded-2xl overflow-hidden relative group cursor-pointer"
                  >
                    <img src={settings.heroImageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                       <span className="text-[10px] font-black uppercase">Carregar da Galeria</span>
                    </div>
                  </div>
                  <input type="file" ref={heroFileInputRef} onChange={(e) => handleImageUpload(e, 'hero')} accept="image/*" className="hidden" />
                </div>
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
