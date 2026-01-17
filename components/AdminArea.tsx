
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
  const [activeTab, setActiveTab] = useState<'songs' | 'ranking' | 'analytics' | 'settings'>('songs');
  const [editingId, setEditingId] = useState<string | null>(null);
  const songFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, likes: 0, isFeatured: false
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'song' | 'hero' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'song') {
          setNewSong({ ...newSong, coverUrl: reader.result as string });
        } else if (type === 'hero') {
          setSettings({ ...settings, heroImageUrl: reader.result as string });
        } else {
          setSettings({ ...settings, logoUrl: reader.result as string });
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
        plays: Number(newSong.plays) || 0,
        downloads: Number(newSong.downloads) || 0,
        likes: Number(newSong.likes) || 0,
        isFeatured: newSong.isFeatured || false
      } as Song;
      setSongs([songToAdd, ...songs]);
    }
    setNewSong({ title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0, likes: 0, isFeatured: false });
  };

  const handleEditClick = (song: Song) => {
    setEditingId(song.id);
    setNewSong(song);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateMetric = (id: string, field: 'plays' | 'downloads' | 'likes', value: number) => {
    setSongs(prev => prev.map(s => s.id === id ? { ...s, [field]: Math.max(0, value) } : s));
  };

  const stats = useMemo(() => {
    const totalPlays = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
    const totalDownloads = songs.reduce((acc, s) => acc + (s.downloads || 0), 0);
    const totalLikes = songs.reduce((acc, s) => acc + (s.likes || 0), 0);

    return {
      totalPlays,
      totalDownloads,
      totalLikes,
      daily: { plays: Math.floor(totalPlays * 0.05), downloads: Math.floor(totalDownloads * 0.04), likes: Math.floor(totalLikes * 0.06) },
      weekly: { plays: Math.floor(totalPlays * 0.25), downloads: Math.floor(totalDownloads * 0.20), likes: Math.floor(totalLikes * 0.30) },
      monthly: { plays: Math.floor(totalPlays * 0.85), downloads: Math.floor(totalDownloads * 0.80), likes: Math.floor(totalLikes * 0.90) }
    };
  }, [songs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white/5">
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Anoni Admin</h2>
          </div>
          <nav className="flex bg-black/40 p-1 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'songs', label: 'Música' },
              { id: 'ranking', label: 'Ranking' },
              { id: 'analytics', label: 'Estatísticas' },
              { id: 'settings', label: 'Template' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                style={{ backgroundColor: activeTab === tab.id ? settings.accentColor : 'transparent' }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onClose} className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Sair do Painel</button>
      </header>

      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-32">
        {activeTab === 'songs' ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <section className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: editingId ? '#3b82f6' : settings.accentColor }} />
              <h3 className="text-xl font-black mb-8 uppercase tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 rounded-full" style={{ backgroundColor: settings.accentColor }} />
                {editingId ? 'Editar Detalhes da Música' : 'Upload de Nova Música'}
              </h3>
              
              <form onSubmit={handleSubmitSong} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:row-span-2 space-y-4">
                  <div 
                    onClick={() => songFileInputRef.current?.click()} 
                    className="w-full aspect-square bg-black border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group hover:border-white/30 transition-all overflow-hidden relative"
                  >
                    {newSong.coverUrl ? (
                      <img src={newSong.coverUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="text-center p-6">
                        <svg className="w-10 h-10 mx-auto text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Capa da Faixa</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={songFileInputRef} onChange={(e) => handleImageUpload(e, 'song')} accept="image/*" className="hidden" />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Título da Obra</label>
                    <input type="text" placeholder="Ex: Zigue-Zague" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none text-sm focus:ring-1 focus:ring-white/20 transition-all" value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Artista / Grupo</label>
                    <input type="text" placeholder="Ex: Caudilho" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none text-sm focus:ring-1 focus:ring-white/20 transition-all" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Gênero Musical</label>
                    <select className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none appearance-none text-sm" value={newSong.genre} onChange={e => setNewSong({...newSong, genre: e.target.value})}>
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Link Direto do Áudio (.mp3)</label>
                    <input type="text" placeholder="https://dropbox.com/s/..." className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none text-sm" value={newSong.audioUrl} onChange={e => setNewSong({...newSong, audioUrl: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-3 gap-4 p-6 bg-black/20 rounded-3xl border border-white/5 mt-2">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-amber-500 tracking-[0.2em]">Plays (Player)</label>
                      <input type="number" className="w-full bg-black border border-white/10 p-3 rounded-xl text-center font-mono text-sm" value={newSong.plays} onChange={e => setNewSong({...newSong, plays: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-blue-500 tracking-[0.2em]">Downloads</label>
                      <input type="number" className="w-full bg-black border border-white/10 p-3 rounded-xl text-center font-mono text-sm" value={newSong.downloads} onChange={e => setNewSong({...newSong, downloads: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-red-500 tracking-[0.2em]">Likes</label>
                      <input type="number" className="w-full bg-black border border-white/10 p-3 rounded-xl text-center font-mono text-sm" value={newSong.likes} onChange={e => setNewSong({...newSong, likes: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 flex justify-end items-center gap-6 pt-4 border-t border-white/5">
                   <label className="flex items-center gap-3 cursor-pointer group mr-auto">
                    <input type="checkbox" checked={newSong.isFeatured} onChange={e => setNewSong({...newSong, isFeatured: e.target.checked})} className="w-6 h-6 rounded-lg bg-black border-white/10 text-amber-500 focus:ring-0" />
                    <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white transition-colors">Destacar na Página Inicial</span>
                  </label>
                  {editingId && (
                    <button type="button" onClick={() => {setEditingId(null); setNewSong({title:'', artist:'', genre:'Rap', plays:0, downloads:0, likes:0})}} className="bg-slate-800 text-white font-black py-4 px-10 rounded-2xl uppercase text-[10px] tracking-widest">Cancelar</button>
                  )}
                  <button type="submit" className="text-slate-950 font-black py-4 px-16 rounded-2xl uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95" style={{ backgroundColor: editingId ? '#3b82f6' : settings.accentColor }}>
                    {editingId ? 'Salvar Alterações' : 'Lançar Música'}
                  </button>
                </div>
              </form>
            </section>

            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <h4 className="font-black uppercase tracking-widest text-xs text-slate-400">Catálogo Ativo ({songs.length})</h4>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-black/40 text-slate-500 text-[9px] font-black uppercase border-b border-white/5">
                      <tr>
                        <th className="p-6">Faixa</th>
                        <th className="p-6 text-center">Plays</th>
                        <th className="p-6 text-center">Downloads</th>
                        <th className="p-6 text-center">Likes</th>
                        <th className="p-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {songs.map(song => (
                        <tr key={song.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-6 flex items-center gap-4">
                            <img src={song.coverUrl} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                            <div>
                              <div className="font-black text-white text-sm uppercase">{song.title}</div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{song.artist}</div>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <input type="number" className="w-20 bg-black/40 border border-white/5 p-2 rounded-lg text-center font-mono text-xs text-amber-500" value={song.plays} onChange={(e) => updateMetric(song.id, 'plays', parseInt(e.target.value) || 0)} />
                          </td>
                          <td className="p-6 text-center">
                            <input type="number" className="w-20 bg-black/40 border border-white/5 p-2 rounded-lg text-center font-mono text-xs text-blue-500" value={song.downloads} onChange={(e) => updateMetric(song.id, 'downloads', parseInt(e.target.value) || 0)} />
                          </td>
                          <td className="p-6 text-center">
                            <input type="number" className="w-20 bg-black/40 border border-white/5 p-2 rounded-lg text-center font-mono text-xs text-red-500" value={song.likes} onChange={(e) => updateMetric(song.id, 'likes', parseInt(e.target.value) || 0)} />
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-3">
                              <button onClick={() => handleEditClick(song)} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg></button>
                              <button onClick={() => setSongs(prev => prev.filter(s => s.id !== song.id))} className="w-9 h-9 rounded-lg bg-red-900/20 flex items-center justify-center hover:bg-red-500 group/del transition-all"><svg className="w-4 h-4 text-red-500 group-hover/del:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        ) : activeTab === 'ranking' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
              <span className="w-2 h-10 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Ranking em Lista</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Otimizado para visualização vertical</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {[...songs].sort((a,b) => (b.plays + b.downloads + b.likes) - (a.plays + a.downloads + a.likes)).map((song, idx) => {
                const total = song.plays + song.downloads + song.likes;
                return (
                  <div key={song.id} className="bg-slate-900/80 border border-white/5 rounded-3xl p-5 flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center">
                       <span className={`text-xl font-black italic ${idx === 0 ? 'text-amber-500' : 'text-slate-600'}`}>{idx + 1}</span>
                    </div>
                    
                    <img src={song.coverUrl} className="w-16 h-16 rounded-2xl object-cover shadow-xl" alt="" />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">{song.title}</h4>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{song.artist}</p>
                      
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                           <span className="text-[9px] font-mono text-slate-300">{song.plays} <span className="text-slate-600 font-sans uppercase">Plays</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           <span className="text-[9px] font-mono text-slate-300">{song.downloads} <span className="text-slate-600 font-sans uppercase">Dwns</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                           <span className="text-[9px] font-mono text-slate-300">{song.likes} <span className="text-slate-600 font-sans uppercase">Likes</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="text-lg font-black text-white font-mono">{total}</div>
                      <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-24 h-24 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg></div>
                   <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Relatório Diário</h5>
                   <div className="space-y-3">
                      <div className="flex justify-between items-end"><span className="text-2xl font-black text-white">{stats.daily.plays}</span><span className="text-[9px] font-bold text-amber-500 uppercase">Plays</span></div>
                      <div className="flex justify-between items-end"><span className="text-2xl font-black text-white">{stats.daily.downloads}</span><span className="text-[9px] font-bold text-blue-500 uppercase">Dwns</span></div>
                   </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group" style={{ borderColor: `${settings.accentColor}20` }}>
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-24 h-24" style={{ color: settings.accentColor }} fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>
                   <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Relatório Semanal</h5>
                   <div className="space-y-3">
                      <div className="flex justify-between items-end"><span className="text-3xl font-black text-white">{stats.weekly.plays}</span><span className="text-[9px] font-bold text-amber-500 uppercase">Plays</span></div>
                      <div className="flex justify-between items-end"><span className="text-3xl font-black text-white">{stats.weekly.downloads}</span><span className="text-[9px] font-bold text-blue-500 uppercase">Dwns</span></div>
                   </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
                   <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Relatório Mensal</h5>
                   <div className="space-y-3">
                      <div className="flex justify-between items-end"><span className="text-4xl font-black text-white">{stats.monthly.plays}</span><span className="text-[9px] font-bold text-amber-500 uppercase">Plays</span></div>
                      <div className="flex justify-between items-end"><span className="text-4xl font-black text-white">{stats.monthly.downloads}</span><span className="text-[9px] font-bold text-blue-500 uppercase">Dwns</span></div>
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-white/5"><h4 className="font-black uppercase tracking-widest text-xs text-white">Auditoria de Desempenho por Faixa</h4></div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {songs.map(song => (
                     <div key={song.id} className="bg-black/40 p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                           <img src={song.coverUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                           <div className="min-w-0">
                              <h6 className="font-black text-white uppercase text-xs truncate">{song.title}</h6>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{song.artist}</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center border-t border-white/5 pt-4">
                           <div><p className="text-lg font-black text-amber-500 font-mono">{song.plays}</p><p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Plays</p></div>
                           <div className="border-x border-white/5"><p className="text-lg font-black text-blue-500 font-mono">{song.downloads}</p><p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Dwns</p></div>
                           <div><p className="text-lg font-black text-red-500 font-mono">{song.likes}</p><p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Likes</p></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-500">
            <section className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
              <h3 className="text-xl font-black mb-8 uppercase" style={{ color: settings.accentColor }}>Identidade e Textos</h3>
              <div className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Nome da Plataforma</label><input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Título do Banner (Hero)</label><input type="text" value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Subtítulo do Banner</label><textarea value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white h-24 resize-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Rodapé Personalizado</label><input type="text" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none text-sm text-white" /></div>
              </div>
            </section>
            <section className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
              <h3 className="text-xl font-black mb-8 uppercase" style={{ color: settings.accentColor }}>Visual e Atmosfera</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Cor de Destaque</label><div className="flex gap-4 items-center bg-black/40 p-3 rounded-2xl border border-white/5"><input type="color" value={settings.accentColor} onChange={e => setSettings({...settings, accentColor: e.target.value})} className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer" /><span className="text-xs font-mono font-bold uppercase">{settings.accentColor}</span></div></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Cor de Fundo</label><div className="flex gap-4 items-center bg-black/40 p-3 rounded-2xl border border-white/5"><input type="color" value={settings.backgroundColor} onChange={e => setSettings({...settings, backgroundColor: e.target.value})} className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer" /><span className="text-xs font-mono font-bold uppercase">{settings.backgroundColor}</span></div></div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Logotipo da Plataforma</label>
                  <div onClick={() => logoFileInputRef.current?.click()} className="w-full h-32 bg-black border-2 border-dashed border-white/10 rounded-[2rem] overflow-hidden relative group cursor-pointer flex items-center justify-center">
                    <img src={settings.logoUrl} className="max-w-full max-h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" alt="Logo Preview" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span className="text-[10px] font-black uppercase tracking-widest">Alterar Logotipo</span></div>
                  </div>
                  <input type="file" ref={logoFileInputRef} onChange={(e) => handleImageUpload(e, 'logo')} accept="image/*" className="hidden" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Capa do Cartaz (Hero Image)</label>
                  <div onClick={() => heroFileInputRef.current?.click()} className="w-full h-56 bg-black border-2 border-dashed border-white/10 rounded-[2rem] overflow-hidden relative group cursor-pointer">
                    <img src={settings.heroImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span className="text-[10px] font-black uppercase tracking-widest">Alterar Imagem da Galeria</span></div>
                  </div>
                  <input type="file" ref={heroFileInputRef} onChange={(e) => handleImageUpload(e, 'hero')} accept="image/*" className="hidden" />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <footer className="p-10 border-t border-white/5 bg-slate-900/50 flex flex-col items-center gap-6">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Core CMS Pro • Hamilton Almeida Domingos</p>
      </footer>
    </div>
  );
};

export default AdminArea;
