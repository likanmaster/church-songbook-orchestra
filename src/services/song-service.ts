import { db, SONGS_COLLECTION, USERS_COLLECTION } from "@/hooks/use-auth-context";
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
  Timestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

const CATEGORIES_COLLECTION = 'categories';

// Convertir datos de Firestore a nuestro modelo Song
const convertFirestoreDataToSong = (id: string, data: any): Song => {
  return {
    id,
    title: data.title || "", 
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
    updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
    userId: data.userId || "",
    isPublic: data.isPublic || false,
    sharedWith: data.sharedWith || [],
    usageCount: data.usageCount || 0
  };
};

// Obtener todas las canciones del usuario actual y las compartidas con él
export const getAllSongs = async (userId: string): Promise<Song[]> => {
  try {
    // Simplificando la consulta para evitar necesitar índices compuestos
    const songsQuery = query(
      collection(db, SONGS_COLLECTION), 
      where("userId", "==", userId)
      // Eliminando orderBy para evitar necesidad de índice compuesto
    );
    
    const querySnapshot = await getDocs(songsQuery);
    const userSongs = querySnapshot.docs.map(doc => 
      convertFirestoreDataToSong(doc.id, doc.data())
    );
    
    // Obtener canciones compartidas con el usuario
    const sharedSongsQuery = query(
      collection(db, SONGS_COLLECTION),
      where("sharedWith", "array-contains", userId)
    );
    
    const sharedSnapshot = await getDocs(sharedSongsQuery);
    const sharedSongs = sharedSnapshot.docs.map(doc => 
      convertFirestoreDataToSong(doc.id, doc.data())
    );
    
    // Obtener canciones públicas
    const publicSongsQuery = query(
      collection(db, SONGS_COLLECTION),
      where("isPublic", "==", true)
    );
    
    const publicSnapshot = await getDocs(publicSongsQuery);
    const publicSongs = publicSnapshot.docs
      .filter(doc => doc.data().userId !== userId) // Excluir las propias que ya se obtuvieron
      .map(doc => convertFirestoreDataToSong(doc.id, doc.data()));
    
    // Ordenar las canciones por título después de obtener todas
    const allSongs = [...userSongs, ...sharedSongs, ...publicSongs];
    return allSongs.sort((a, b) => a.title.localeCompare(b.title));
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
export const createSong = async (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Song> => {
  try {
    // Preparamos los datos, eliminando propiedades undefined o null
    const cleanedData = Object.fromEntries(
      Object.entries(songData).filter(([_, v]) => v != null)
    );
    
    const songToSave = {
      ...cleanedData,
      title: songData.title || "", // Ensure title is defined
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      usageCount: 0 // Inicializar contador de uso
    };
    
    const docRef = await addDoc(collection(db, SONGS_COLLECTION), songToSave);
    
    // Actualizar el array de canciones del usuario
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      songs: arrayUnion(docRef.id),
      updatedAt: serverTimestamp()
    });
    
    // Construimos un objeto Song con los datos que acabamos de guardar
    const newSong: Song = {
      id: docRef.id,
      title: songData.title || "", // Ensure required title is included
      lyrics: songData.lyrics || null,
      author: songData.author || null,
      key: songData.key || null,
      tempo: songData.tempo || null,
      style: songData.style || null,
      duration: songData.duration || null,
      notes: songData.notes || null,
      attachments: songData.attachments || [],
      categories: songData.categories || [],
      tags: songData.tags || [],
      isFavorite: songData.isFavorite || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId,
      isPublic: songData.isPublic || false,
      sharedWith: songData.sharedWith || [],
      usageCount: 0
    };
    
    return newSong;
  } catch (error) {
    console.error("Error al crear canción:", error);
    throw error;
  }
};

// Actualizar canción existente
export const updateSong = async (id: string, songData: Partial<Song>, userId: string): Promise<Song> => {
  try {
    const songRef = doc(db, SONGS_COLLECTION, id);
    
    // Verificar que el usuario sea propietario de la canción
    const songDoc = await getDoc(songRef);
    if (!songDoc.exists()) {
      throw new Error("La canción no existe");
    }
    
    const songOwner = songDoc.data().userId;
    if (songOwner !== userId) {
      throw new Error("No tienes permiso para editar esta canción");
    }
    
    // Eliminar propiedades que no queremos actualizar en Firestore
    const { id: _, createdAt, updatedAt, userId: __, usageCount, ...dataToUpdate } = songData as any;
    
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
    
    // Ensure we have all required fields for the Song type
    const updatedSong: Song = {
      id,
      title: songData.title !== undefined ? songData.title : currentData?.title || "",
      lyrics: songData.lyrics !== undefined ? songData.lyrics : currentData?.lyrics || null,
      author: songData.author !== undefined ? songData.author : currentData?.author || null,
      key: songData.key !== undefined ? songData.key : currentData?.key || null,
      tempo: songData.tempo !== undefined ? songData.tempo : currentData?.tempo || null,
      style: songData.style !== undefined ? songData.style : currentData?.style || null,
      duration: songData.duration !== undefined ? songData.duration : currentData?.duration || null,
      notes: songData.notes !== undefined ? songData.notes : currentData?.notes || null,
      attachments: songData.attachments !== undefined ? songData.attachments : currentData?.attachments || [],
      categories: songData.categories !== undefined ? songData.categories : currentData?.categories || [],
      tags: songData.tags !== undefined ? songData.tags : currentData?.tags || [],
      isFavorite: songData.isFavorite !== undefined ? songData.isFavorite : currentData?.isFavorite || false,
      createdAt: createdAt || currentData?.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentData?.userId || userId,
      isPublic: songData.isPublic !== undefined ? songData.isPublic : currentData?.isPublic || false,
      sharedWith: songData.sharedWith !== undefined ? songData.sharedWith : currentData?.sharedWith || [],
      usageCount: currentData?.usageCount || 0
    };
    
    return updatedSong;
  } catch (error) {
    console.error("Error al actualizar canción:", error);
    throw error;
  }
};

// Eliminar canción
export const deleteSong = async (id: string, userId: string): Promise<void> => {
  try {
    const songRef = doc(db, SONGS_COLLECTION, id);
    
    // Verificar que el usuario sea propietario de la canción
    const songDoc = await getDoc(songRef);
    if (!songDoc.exists()) {
      throw new Error("La canción no existe");
    }
    
    const songOwner = songDoc.data().userId;
    if (songOwner !== userId) {
      throw new Error("No tienes permiso para eliminar esta canción");
    }
    
    await deleteDoc(songRef);
    
    // Actualizar el array de canciones del usuario
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      songs: arrayRemove(id),
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error("Error al eliminar canción:", error);
    throw error;
  }
};

// Actualizar favorito de canción
export const toggleSongFavorite = async (id: string, isFavorite: boolean, userId: string): Promise<void> => {
  try {
    const songRef = doc(db, SONGS_COLLECTION, id);
    
    // Verificar que el usuario sea propietario de la canción o la canción esté compartida
    const songDoc = await getDoc(songRef);
    if (!songDoc.exists()) {
      throw new Error("La canción no existe");
    }
    
    const songData = songDoc.data();
    const canModify = songData.userId === userId || 
                     (songData.sharedWith && songData.sharedWith.includes(userId)) ||
                     songData.isPublic === true;
                     
    if (!canModify) {
      throw new Error("No tienes permiso para modificar esta canción");
    }
    
    await updateDoc(songRef, { 
      isFavorite: isFavorite,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    throw error;
  }
};

// Actualizar accesibilidad de la canción (pública/privada)
export const updateSongPublicStatus = async (id: string, isPublic: boolean, userId: string): Promise<void> => {
  try {
    const songRef = doc(db, SONGS_COLLECTION, id);
    
    // Verificar que el usuario sea propietario de la canción
    const songDoc = await getDoc(songRef);
    if (!songDoc.exists()) {
      throw new Error("La canción no existe");
    }
    
    const songOwner = songDoc.data().userId;
    if (songOwner !== userId) {
      throw new Error("No tienes permiso para modificar esta canción");
    }
    
    await updateDoc(songRef, { 
      isPublic: isPublic,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error("Error al actualizar estado público:", error);
    throw error;
  }
};

// Incrementar el contador de uso de la canción
export const incrementSongUsageCount = async (id: string): Promise<void> => {
  try {
    const songRef = doc(db, SONGS_COLLECTION, id);
    
    const songDoc = await getDoc(songRef);
    if (!songDoc.exists()) {
      throw new Error("La canción no existe");
    }
    
    const currentUsageCount = songDoc.data().usageCount || 0;
    
    await updateDoc(songRef, { 
      usageCount: currentUsageCount + 1,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error("Error al incrementar contador de uso:", error);
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
