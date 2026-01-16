
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0
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
        downloads: 0
      };
      setSongs([songToAdd, ...songs]);
    }
    setNewSong({ title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0 });
  };

  const handleEditClick = (song: Song) => {
    setEditingId(song.id);
    setNewSong(song);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewSong({ title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0 });
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
    
    const genreData = GENRES.map(genre => {
      const genreSongs = songs.filter(s => s.genre === genre);
      const genrePlays = genreSongs.reduce((acc, s) => acc + (s.plays || 0), 0);
      return { 
        name: genre, 
        count: genreSongs.length, 
        plays: genrePlays,
        percentage: totalPlays > 0 ? (genrePlays / totalPlays) * 100 : 0
      };
    }).sort((a, b) => b.plays - a.plays);

    const artistMap: Record<string, number> = {};
    songs.forEach(s => {
      artistMap[s.artist] = (artistMap[s.artist] || 0) + (s.plays || 0);
    });
    const topArtists = Object.entries(artistMap)
      .map(([name, plays]) => ({ name, plays }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    return { totalPlays, totalDownloads, genreData, topArtists };
  }, [songs]);

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
                  <div 
                    onClick={triggerFileUpload}
                    className="w-full aspect-square bg-black border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer group hover:border-amber-500/50 transition-all overflow-hidden relative"
                  >
                    {newSong.coverUrl ? (
                      <>
                        <img src={newSong.coverUrl} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[10px] font-black uppercase text-white bg-black/50 px-4 py-2 rounded-full">Trocar Imagem</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-600 group-hover:text-amber-500 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase text-slate-600 group-hover:text-slate-300">Carregar da Galeria</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Título da Track</label>
                  <input type="text" placeholder="Ex: Zigue-Zague" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all text-sm" value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Artista / Grupo</label>
                  <input type="text" placeholder="Ex: Caudilho" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all text-sm" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Gênero</label>
                  <select className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none text-sm" value={newSong.genre} onChange={e => setNewSong({...newSong, genre: e.target.value})}>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">URL do Arquivo MP3</label>
                  <input type="text" placeholder="https://..." className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all text-sm" value={newSong.audioUrl} onChange={e => setNewSong({...newSong, audioUrl: e.target.value})} />
                </div>
                
                <div className="md:col-span-3 flex justify-end gap-4 mt-4">
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="bg-slate-800 text-white font-black py-4 px-12 rounded-2xl uppercase text-xs hover:bg-slate-700 transition-all">Cancelar</button>
                  )}
                  <button type="submit" className={`${editingId ? 'bg-blue-600' : 'bg-amber-500'} text-black font-black py-4 px-12 rounded-2xl uppercase text-xs hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-xl`}>
                    {editingId ? 'Guardar Alterações' : 'Publicar Agora'}
                  </button>
                </div>
              </form>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase tracking-tight">Acervo Musical</h3>
                <span className="text-[10px] font-bold bg-white/5 px-4 py-2 rounded-full text-slate-400">{songs.length} FAIXAS ATIVAS</span>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-black/40 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="p-6">TRACK DETAILS</th>
                      <th className="p-6 text-center">PLAYS</th>
                      <th className="p-6 text-center">DWNLDS</th>
                      <th className="p-6 text-right">MGMT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {songs.map(song => (
                      <tr key={song.id} className={`hover:bg-white/[0.02] transition-colors ${editingId === song.id ? 'bg-blue-500/5' : ''}`}>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover bg-black ring-1 ring-white/10" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{song.title}</div>
                              <div className="text-xs text-slate-500 truncate">{song.artist} • <span className="text-amber-500 uppercase font-black text-[9px]">{song.genre}</span></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-center font-mono text-amber-500 text-lg font-bold">{song.plays || 0}</td>
                        <td className="p-6 text-center font-mono text-slate-300 text-lg font-bold">{song.downloads || 0}</td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditClick(song)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${editingId === song.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400'}`} title="Editar Info">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => resetStats(song.id)} className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-white hover:text-black transition-all" title="Reset Stats">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                            <button onClick={() => removeSong(song.id)} className="w-10 h-10 rounded-xl bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all" title="Eliminar Música">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        ) : activeTab === 'analytics' ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Total de Plays</p>
                <div className="text-4xl font-black text-amber-500">{stats.totalPlays.toLocaleString()}</div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-amber-500 w-[70%]" />
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Downloads</p>
                <div className="text-4xl font-black text-white">{stats.totalDownloads.toLocaleString()}</div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-white w-[45%]" />
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Músicas Ativas</p>
                <div className="text-4xl font-black text-slate-400">{songs.length}</div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-slate-400 w-[100%]" />
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Taxa de Conversão</p>
                <div className="text-4xl font-black text-blue-500">
                  {stats.totalPlays > 0 ? ((stats.totalDownloads / stats.totalPlays) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase italic">Downloads / Plays</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Desempenho por Gênero</h3>
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div className="space-y-6">
                  {stats.genreData.map(genre => (
                    <div key={genre.name} className="group">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                        <span className="text-slate-400">{genre.name}</span>
                        <span className="text-white">{genre.plays.toLocaleString()} plays</span>
                      </div>
                      <div className="w-full h-3 bg-black/50 rounded-full border border-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 ease-out"
                          style={{ width: `${genre.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Top Artistas Influentes</h3>
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div className="space-y-4">
                  {stats.topArtists.length > 0 ? stats.topArtists.map((artist, idx) => (
                    <div key={artist.name} className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:bg-black transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center font-black text-amber-500">
                        #{idx + 1}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-black uppercase tracking-tight text-white">{artist.name}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{artist.plays} Reproduções totais</p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center text-slate-600 text-xs font-black uppercase italic">Sem dados de artistas disponíveis</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
              <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-amber-500">Identidade Visual</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Nome Corporativo</label>
                  <input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">URL do Logotipo</label>
                  <input type="text" placeholder="https://..." value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Cor da Marca</label>
                  <div className="flex gap-4 items-center bg-black p-3 rounded-xl border border-white/10">
                    <input type="color" value={settings.accentColor} onChange={e => setSettings({...settings, accentColor: e.target.value})} className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none" />
                    <span className="font-mono text-sm uppercase text-slate-400">{settings.accentColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Texto do Rodapé</label>
                  <input type="text" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" />
                </div>
              </div>
            </section>

            <section className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
              <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-amber-500">Configuração do Hero</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Título de Impacto</label>
                  <input type="text" value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Subtítulo Estratégico</label>
                  <textarea rows={3} value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none resize-none focus:ring-1 focus:ring-amber-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Imagem Principal (URL)</label>
                  <input type="text" value={settings.heroImageUrl} onChange={e => setSettings({...settings, heroImageUrl: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-sm" />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <footer className="p-6 text-center border-t border-white/5 bg-black/80">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
          CORE CMS Management System &copy; {new Date().getFullYear()} • Developed by Hamilton Almeida Domingos
        </p>
      </footer>
    </div>
  );
};

export default AdminArea;
