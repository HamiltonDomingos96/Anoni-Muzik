
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  genre: string;
  plays: number;
  downloads: number;
}

export interface SiteSettings {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  accentColor: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
}
