
import { db } from "@/hooks/use-auth-context";
import { Song, Category } from "@/types";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

// Colección de canciones en Firestore
const SONGS_COLLECTION = 'songs';
const CATEGORIES_COLLECTION = 'categories';

// Convertir datos de Firestore a nuestro modelo Song
const convertFirestoreDataToSong = (id: string, data: any): Song => {
  return {
    id,
    title: data.title,
    author: data.author || null,
    key: data.key || null,
    tempo: data.tempo || null,
    style: data.style || null,
    duration: data.duration || null,
    categories: data.categories || [],
    tags: data.tags || [],
    lyrics: data.lyrics || null,
    notes: data.notes || null,
    isFavorite: data.isFavorite || false,
    createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
  };
};

// Obtener todas las canciones
export const getAllSongs = async (): Promise<Song[]> => {
  try {
    const songsQuery = query(collection(db, SONGS_COLLECTION), orderBy('title'));
    const querySnapshot = await getDocs(songsQuery);
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreDataToSong(doc.id, doc.data())
    );
  } catch (error) {
    console.error("Error al obtener canciones:", error);
    // En caso de error de permisos, devolvemos un array vacío
    return [];
  }
};

// Obtener canción por ID
export const getSongById = async (id: string): Promise<Song | null> => {
  try {
    const songDoc = await getDoc(doc(db, SONGS_COLLECTION, id));
    
    if (songDoc.exists()) {
      return convertFirestoreDataToSong(songDoc.id, songDoc.data());
    }
    
    return null;
  } catch (error) {
    console.error("Error al obtener canción:", error);
    throw error;
  }
};

// Crear nueva canción
export const createSong = async (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
  try {
    // Preparamos los datos, eliminando propiedades undefined o null
    const cleanedData = Object.fromEntries(
      Object.entries(songData).filter(([_, v]) => v != null)
    );
    
    const songToSave = {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, SONGS_COLLECTION), songToSave);
    
    // Construimos un objeto Song con los datos que acabamos de guardar
    const newSong: Song = {
      id: docRef.id,
      ...songData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newSong;
  } catch (error) {
    console.error("Error al crear canción:", error);
    throw error;
  }
};

// Actualizar canción existente
export const updateSong = async (id: string, songData: Partial<Song>): Promise<Song> => {
  try {
    const songRef = doc(db, SONGS_COLLECTION, id);
    
    // Eliminar propiedades que no queremos actualizar en Firestore
    const { id: _, createdAt, updatedAt, ...dataToUpdate } = songData as any;
    
    // Preparamos los datos, eliminando propiedades undefined o null
    const cleanedData = Object.fromEntries(
      Object.entries(dataToUpdate).filter(([_, v]) => v != null)
    );
    
    const updateData = {
      ...cleanedData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(songRef, updateData);
    
    // Obtener datos actuales para actualizar
    const currentDoc = await getDoc(songRef);
    const currentData = currentDoc.data();
    
    // Construir objeto Song con datos actualizados
    const updatedSong: Song = {
      id,
      ...songData,
      createdAt: createdAt || currentData?.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return updatedSong;
  } catch (error) {
    console.error("Error al actualizar canción:", error);
    throw error;
  }
};

// Eliminar canción
export const deleteSong = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SONGS_COLLECTION, id));
  } catch (error) {
    console.error("Error al eliminar canción:", error);
    throw error;
  }
};

// Actualizar favorito de canción
export const toggleSongFavorite = async (id: string, isFavorite: boolean): Promise<void> => {
  try {
    const songRef = doc(db, SONGS_COLLECTION, id);
    await updateDoc(songRef, { 
      isFavorite: isFavorite,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    throw error;
  }
};

// Obtener todas las categorías
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      color: doc.data().color
    }));
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    
    // Si no existen categorías todavía, retornamos un conjunto predeterminado
    return [
      { id: "1", name: "Adoración", color: "bg-blue-500" },
      { id: "2", name: "Alabanza", color: "bg-green-500" },
      { id: "3", name: "Clásicos", color: "bg-red-500" },
      { id: "4", name: "Contemporáneo", color: "bg-purple-500" },
      { id: "5", name: "Español", color: "bg-yellow-500" }
    ];
  }
};
