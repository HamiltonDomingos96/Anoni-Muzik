
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  genre: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
}
