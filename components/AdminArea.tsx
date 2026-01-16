
import React, { useState } from 'react';
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
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: '', artist: '', genre: 'Rap', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0
  });

  const handleSubmitSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.audioUrl) return;

    if (editingId) {
      // Update existing song
      setSongs(songs.map(s => s.id === editingId ? { ...s, ...newSong as Song } : s));
      setEditingId(null);
    } else {
      // Add new song
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

  const totalPlays = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
  const totalDownloads = songs.reduce((acc, s) => acc + (s.downloads || 0), 0);

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
                {tab === 'songs' ? 'Músicas' : tab === 'analytics' ? 'Dados' : 'Template'}
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Título da Track</label>
                  <input type="text" placeholder="Ex: Zigue-Zague" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all" value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Artista / Grupo</label>
                  <input type="text" placeholder="Ex: Caudilho" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Gênero</label>
                  <select className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none" value={newSong.genre} onChange={e => setNewSong({...newSong, genre: e.target.value})}>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">URL do Arquivo MP3</label>
                  <input type="text" placeholder="https://..." className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all" value={newSong.audioUrl} onChange={e => setNewSong({...newSong, audioUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">URL da Capa (1:1)</label>
                  <input type="text" placeholder="https://..." className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition-all" value={newSong.coverUrl} onChange={e => setNewSong({...newSong, coverUrl: e.target.value})} />
                </div>
                <div className="md:col-span-3 flex justify-end gap-4">
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
                              {editingId === song.id && (
                                <div className="absolute inset-0 bg-blue-500/40 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                </div>
                              )}
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
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Alcance Global</p>
                <div className="text-5xl font-black text-amber-500">{totalPlays}</div>
                <p className="text-xs text-slate-400 mt-2 italic">Total de reproduções em tempo real</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Conversão de Download</p>
                <div className="text-5xl font-black text-white">{totalDownloads}</div>
                <p className="text-xs text-slate-400 mt-2 italic">Baixados para escuta offline</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Engajamento Médio</p>
                <div className="text-5xl font-black text-slate-400">{(totalPlays / (songs.length || 1)).toFixed(1)}</div>
                <p className="text-xs text-slate-400 mt-2 italic">Plays por track ativa</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
              <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-amber-500">Identidade Visual</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Nome Corporativo</label>
                  <input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">URL do Logotipo</label>
                  <input type="text" placeholder="https://..." value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500" />
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
                  <input type="text" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
            </section>

            <section className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-xl">
              <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-amber-500">Configuração do Hero</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Título de Impacto</label>
                  <input type="text" value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Subtítulo Estratégico</label>
                  <textarea rows={3} value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none resize-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Imagem Principal (URL)</label>
                  <input type="text" value={settings.heroImageUrl} onChange={e => setSettings({...settings, heroImageUrl: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:ring-1 focus:ring-amber-500" />
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
