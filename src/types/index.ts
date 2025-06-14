export interface Song {
  id: string;
  title: string;
  author: string;
  key: string;
  lyrics: string;
  tempo?: number | null;
  tags: string[];
  categories: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  isFavorite: boolean;
  style?: string | null;
  duration?: number | null;
  notes?: string | null;
  isPublic: boolean;
  sharedWith: string[];
  createdBy?: string; // Nombre del usuario que creó la canción
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
  theme?: string | null;
  preacher?: string | null;
  notes?: string | null;
  songs: ServiceSong[];
  createdAt: string;
  updatedAt: string;
  sections: ServiceSection[];
  userId: string;
  isPublic: boolean;
  sharedWith: string[];
  createdBy?: string; // Nombre del usuario que creó el servicio
}

export interface ServiceSong {
  id: string;
  songId: string;
  order: number;
  notes?: string;
}

export interface ServiceSection {
  id: string;
  text: string;
  order: number;
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

export type ServiceSongItem = {
  type: 'song';
  data: Song & { order: number; serviceNotes?: string };
}

export type ServiceSectionItem = {
  type: 'section';
  data: {
    id: string;
    text: string;
    order: number;
  };
}

export type ServiceItemType = ServiceSongItem | ServiceSectionItem;

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: GroupMember[];
  sharedSongs: string[]; // IDs de canciones compartidas
  sharedServices: string[]; // IDs de servicios compartidos
  messages?: GroupMessage[]; // Mensajes del chat del grupo
}

export interface GroupMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type?: 'text' | 'system'; // Para mensajes del sistema como "usuario se unió"
}

export interface GroupMember {
  id: string;
  userId: string;
  username: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  photoURL?: string;
  songs?: string[]; // IDs de canciones propias
  groups?: string[]; // IDs de grupos a los que pertenece
}
