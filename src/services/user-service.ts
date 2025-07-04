import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, USERS_COLLECTION } from "@/hooks/use-auth-context";

// Obtener estilos musicales del usuario
export const getUserMusicStyles = async (userId: string): Promise<string[]> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.musicStyles || [];
    }
    
    return [];
  } catch (error) {
    console.error("Error al obtener estilos musicales:", error);
    return [];
  }
};

// Actualizar estilos musicales del usuario
export const updateUserMusicStyles = async (userId: string, musicStyles: string[]): Promise<void> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userDocRef, {
      musicStyles: musicStyles,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al actualizar estilos musicales:", error);
    throw error;
  }
};

// Agregar estilo musical
export const addMusicStyle = async (userId: string, style: string): Promise<string[]> => {
  try {
    const currentStyles = await getUserMusicStyles(userId);
    
    // Verificar que no exista ya
    if (!currentStyles.includes(style.trim())) {
      const newStyles = [...currentStyles, style.trim()];
      await updateUserMusicStyles(userId, newStyles);
      return newStyles;
    }
    
    return currentStyles;
  } catch (error) {
    console.error("Error al agregar estilo musical:", error);
    throw error;
  }
};

// Eliminar estilo musical
export const removeMusicStyle = async (userId: string, style: string): Promise<string[]> => {
  try {
    const currentStyles = await getUserMusicStyles(userId);
    const newStyles = currentStyles.filter(s => s !== style);
    
    await updateUserMusicStyles(userId, newStyles);
    return newStyles;
  } catch (error) {
    console.error("Error al eliminar estilo musical:", error);
    throw error;
  }
};

// Editar estilo musical
export const editMusicStyle = async (userId: string, oldStyle: string, newStyle: string): Promise<string[]> => {
  try {
    const currentStyles = await getUserMusicStyles(userId);
    const styleIndex = currentStyles.indexOf(oldStyle);
    
    if (styleIndex !== -1 && !currentStyles.includes(newStyle.trim()) && newStyle.trim() !== '') {
      const newStyles = [...currentStyles];
      newStyles[styleIndex] = newStyle.trim();
      
      await updateUserMusicStyles(userId, newStyles);
      return newStyles;
    }
    
    return currentStyles;
  } catch (error) {
    console.error("Error al editar estilo musical:", error);
    throw error;
  }
};

// Tipos para la plantilla de servicio
export type DefaultServiceTemplateItem = {
  id: string;
  type: 'section' | 'song';
  text?: string; // Para secciones
  songId?: string; // Para canciones
  order: number;
};

export type DefaultServiceTemplate = {
  title: string;
  items: DefaultServiceTemplateItem[];
};

// Obtener plantilla de servicio predeterminada del usuario
export const getUserDefaultServiceTemplate = async (userId: string): Promise<DefaultServiceTemplate | null> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.defaultServiceTemplate || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error al obtener plantilla de servicio predeterminada:", error);
    return null;
  }
};

// Actualizar plantilla de servicio predeterminada del usuario
export const updateUserDefaultServiceTemplate = async (userId: string, template: DefaultServiceTemplate | null): Promise<void> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userDocRef, {
      defaultServiceTemplate: template,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al actualizar plantilla de servicio predeterminada:", error);
    throw error;
  }
};
