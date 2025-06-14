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
  userId: string; // ID del usuario propietario
  isPublic?: boolean; // Indica si la canción es pública (visible para todos)
  sharedWith?: string[]; // IDs de usuarios con los que se ha compartido
  rating?: number; // Rating from 0 to 5 stars
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
  sections?: ServiceSection[];
  userId: string; // ID del usuario propietario
  isPublic?: boolean; // Indica si el servicio es público
  sharedWith?: string[]; // IDs de usuarios con los que se ha compartido
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
