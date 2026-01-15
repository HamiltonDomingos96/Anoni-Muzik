
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
  const [activeTab, setActiveTab] = useState<'songs' | 'settings'>('songs');
  const [newSong, setNewSong] = useState<Partial<Song>>({
    title: '', artist: '', genre: 'Electronic', coverUrl: '', audioUrl: '', duration: '3:00'
  });

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.audioUrl) return;
    const songToAdd: Song = {
      ...newSong as Song,
      id: Date.now().toString()
    };
    setSongs([songToAdd, ...songs]);
    setNewSong({ title: '', artist: '', genre: 'Electronic', coverUrl: '', audioUrl: '', duration: '3:00' });
  };

  const removeSong = (id: string) => {
    setSongs(songs.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 rounded">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            Painel Admin
          </h2>
          <nav className="flex gap-2 ml-8">
            <button 
              onClick={() => setActiveTab('songs')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'songs' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}
            >
              Músicas
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}
            >
              Configurações
            </button>
          </nav>
        </div>
        <button 
          onClick={onClose}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          Sair do Painel
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        {activeTab === 'songs' ? (
          <div className="space-y-8">
            {/* Form Add */}
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold mb-4">Adicionar Nova Música</h3>
              <form onSubmit={handleAddSong} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Título" 
                  className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})}
                />
                <input 
                  type="text" placeholder="Artista" 
                  className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})}
                />
                <input 
                  type="text" placeholder="URL do Áudio (MP3)" 
                  className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newSong.audioUrl} onChange={e => setNewSong({...newSong, audioUrl: e.target.value})}
                />
                <input 
                  type="text" placeholder="URL da Capa (Imagem)" 
                  className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newSong.coverUrl} onChange={e => setNewSong({...newSong, coverUrl: e.target.value})}
                />
                <select 
                  className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newSong.genre} onChange={e => setNewSong({...newSong, genre: e.target.value})}
                >
                  <option>Regional</option>
                  <option>Electronic</option>
                  <option>Synthwave</option>
                  <option>Hip Hop</option>
                  <option>Acoustic</option>
                  <option>Ambient</option>
                </select>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 font-bold p-3 rounded-xl transition-colors">
                  Salvar Música
                </button>
              </form>
            </section>

            {/* List */}
            <section>
              <h3 className="text-lg font-bold mb-4">Gerenciar Músicas ({songs.length})</h3>
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-700/50 text-slate-400 text-sm uppercase">
                    <tr>
                      <th className="p-4 font-medium">Faixa</th>
                      <th className="p-4 font-medium">Artista</th>
                      <th className="p-4 font-medium">Gênero</th>
                      <th className="p-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {songs.map(song => (
                      <tr key={song.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={song.coverUrl} className="w-10 h-10 rounded object-cover bg-slate-900" />
                          <span className="font-medium">{song.title}</span>
                        </td>
                        <td className="p-4 text-slate-300">{song.artist}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 bg-slate-700 rounded uppercase">{song.genre}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => removeSong(song.id)}
                            className="text-red-400 hover:text-red-300 p-2"
                          >
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
        ) : (
          <div className="space-y-8 max-w-2xl">
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold mb-4">Informações do Site</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome da Plataforma</label>
                  <input 
                    type="text" 
                    value={settings.siteName} 
                    onChange={e => setSettings({...settings, siteName: e.target.value})}
                    className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Cor de Destaque</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={settings.accentColor} 
                      onChange={e => setSettings({...settings, accentColor: e.target.value})}
                      className="w-12 h-12 rounded bg-transparent cursor-pointer"
                    />
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
                  <input 
                    type="text" 
                    value={settings.heroTitle} 
                    onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                    className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Subtítulo</label>
                  <textarea 
                    rows={3}
                    value={settings.heroSubtitle} 
                    onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                    className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">URL Imagem de Fundo</label>
                  <input 
                    type="text" 
                    value={settings.heroImageUrl} 
                    onChange={e => setSettings({...settings, heroImageUrl: e.target.value})}
                    className="bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </section>

            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-3 text-blue-200">
               <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <p className="text-sm">As alterações feitas aqui são salvas localmente no seu navegador e refletidas instantaneamente na interface pública.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminArea;
