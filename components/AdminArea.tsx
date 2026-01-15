
import React, { useState } from 'react';
import { Song, SiteSettings } from '../types';

interface AdminAreaProps {
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onClose: () => void;
}

const AdminArea: React.FC<AdminAreaProps> = ({ songs, setSongs, settings, setSettings, onClose }) => {
  const [activeTab, setActiveTab] = useState<'songs' | 'settings' | 'analytics'>('songs');
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: '', artist: '', genre: 'Electronic', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0
  });

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.audioUrl) return;
    const songToAdd: Song = {
      ...newSong as Song,
      id: Date.now().toString(),
      plays: 0,
      downloads: 0
    };
    setSongs([songToAdd, ...songs]);
    setNewSong({ title: '', artist: '', genre: 'Electronic', coverUrl: '', audioUrl: '', duration: '3:00', plays: 0, downloads: 0 });
  };

  const removeSong = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta música?')) {
      setSongs(songs.filter(s => s.id !== id));
    }
  };

  const resetStats = (id: string) => {
    setSongs(songs.map(s => s.id === id ? { ...s, plays: 0, downloads: 0 } : s));
  };

  const totalPlays = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
  const totalDownloads = songs.reduce((acc, s) => acc + (s.downloads || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 rounded">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            </span>
            Painel Admin
          </h2>
          <nav className="flex gap-2 ml-8">
            <button onClick={() => setActiveTab('songs')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'songs' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}>Músicas</button>
            <button onClick={() => setActiveTab('analytics')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}>Estatísticas</button>
            <button onClick={() => setActiveTab('settings')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}>Configurações</button>
          </nav>
        </div>
        <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">Sair do Painel</button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        {activeTab === 'songs' ? (
          <div className="space-y-8">
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold mb-4">Adicionar Nova Música</h3>
              <form onSubmit={handleAddSong} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Título" className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} />
                <input type="text" placeholder="Artista" className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} />
                <input type="text" placeholder="URL do Áudio (MP3)" className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" value={newSong.audioUrl} onChange={e => setNewSong({...newSong, audioUrl: e.target.value})} />
                <input type="text" placeholder="URL da Capa" className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" value={newSong.coverUrl} onChange={e => setNewSong({...newSong, coverUrl: e.target.value})} />
                <select className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" value={newSong.genre} onChange={e => setNewSong({...newSong, genre: e.target.value})}>
                  <option>Regional</option><option>Electronic</option><option>Synthwave</option><option>Hip Hop</option><option>Acoustic</option><option>Ambient</option>
                </select>
                <button type="submit" className="bg-indigo-600 font-bold p-3 rounded-xl">Salvar Música</button>
              </form>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-4">Gerenciar Músicas</h3>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-700/50 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-4 font-medium">Faixa</th>
                      <th className="p-4 font-medium text-center">Plays</th>
                      <th className="p-4 font-medium text-center">Downloads</th>
                      <th className="p-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {songs.map(song => (
                      <tr key={song.id} className="hover:bg-slate-700/30">
                        <td className="p-4 flex items-center gap-3">
                          <img src={song.coverUrl} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <div className="font-medium">{song.title}</div>
                            <div className="text-xs text-slate-400">{song.artist}</div>
                          </div>
                        </td>
                        <td className="p-4 text-center font-mono text-indigo-400">{song.plays || 0}</td>
                        <td className="p-4 text-center font-mono text-emerald-400">{song.downloads || 0}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => resetStats(song.id)} className="text-slate-400 hover:text-white p-2" title="Zerar Stats">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                          <button onClick={() => removeSong(song.id)} className="text-red-400 hover:text-red-300 p-2" title="Excluir">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Total de Plays</p>
                <h4 className="text-4xl font-black text-indigo-400">{totalPlays}</h4>
              </div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Total de Downloads</p>
                <h4 className="text-4xl font-black text-emerald-400">{totalDownloads}</h4>
              </div>
            </div>
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold mb-4">Rank de Popularidade</h3>
              <div className="space-y-4">
                {[...songs].sort((a, b) => (b.plays + b.downloads) - (a.plays + a.downloads)).slice(0, 5).map((song, i) => (
                  <div key={song.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-bold w-4 text-center">{i+1}</span>
                      <img src={song.coverUrl} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium text-sm">{song.title}</p>
                        <p className="text-xs text-slate-500">{song.artist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">Pontos</p>
                      <p className="text-lg font-mono text-white">{(song.plays || 0) + (song.downloads || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 max-w-2xl">
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold mb-4">Informações do Site</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome da Plataforma</label>
                  <input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Cor de Destaque</label>
                  <div className="flex gap-4 items-center">
                    <input type="color" value={settings.accentColor} onChange={e => setSettings({...settings, accentColor: e.target.value})} className="w-12 h-12 rounded bg-transparent cursor-pointer" />
                    <span className="text-sm font-mono text-slate-300 uppercase">{settings.accentColor}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold mb-4">Destaque (Hero)</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Título Principal</label>
                  <input type="text" value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Subtítulo</label>
                  <textarea rows={3} value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none resize-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">URL Imagem de Fundo</label>
                  <input type="text" value={settings.heroImageUrl} onChange={e => setSettings({...settings, heroImageUrl: e.target.value})} className="bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminArea;
