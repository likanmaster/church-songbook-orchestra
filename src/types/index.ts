export interface Song {
  id: string;
  title: string;
  lyrics?: string;
  author?: string;
  key?: string;
  tempo?: number;
  style?: string;
  duration?: number;
  notes?: string;
  attachments?: Attachment[];
  categories: string[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  audioUrl?: string;
  videoUrl?: string;
  usageCount?: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Service {
  id: string;
  title: string;
  date: string;
  theme?: string;
  preacher?: string;
  notes?: string;
  songs: ServiceSong[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSong {
  id: string;
  songId: string;
  order: number;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface SongFilter {
  search?: string;
  categories?: string[];
  minDuration?: number;
  maxDuration?: number;
  key?: string;
  tempo?: string;
  style?: string;
  favorite?: boolean;
}
