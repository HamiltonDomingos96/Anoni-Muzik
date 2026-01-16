
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
  likes: number; 
  isFeatured?: boolean;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  accentColor: string;
  backgroundColor: string; // Nova propriedade para o fundo do site
  footerText: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
}
