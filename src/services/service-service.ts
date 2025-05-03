
import { db } from "@/hooks/use-auth-context";
import { Service, ServiceSong } from "@/types";
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
  serverTimestamp 
} from "firebase/firestore";

// Colección de servicios en Firestore
const SERVICES_COLLECTION = 'services';

// Convertir datos de Firestore a nuestro modelo Service
const convertFirestoreDataToService = (id: string, data: any): Service => {
  return {
    id,
    title: data.title,
    date: data.date,
    theme: data.theme || null,
    preacher: data.preacher || null,
    notes: data.notes || null,
    songs: data.songs || [],
    createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
  };
};

// Obtener todos los servicios
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const servicesQuery = query(collection(db, SERVICES_COLLECTION), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(servicesQuery);
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreDataToService(doc.id, doc.data())
    );
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    // En caso de error de permisos, devolvemos un array vacío
    return [];
  }
};

// Obtener servicio por ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  try {
    const serviceDoc = await getDoc(doc(db, SERVICES_COLLECTION, id));
    
    if (serviceDoc.exists()) {
      return convertFirestoreDataToService(serviceDoc.id, serviceDoc.data());
    }
    
    return null;
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    throw error;
  }
};

// Crear nuevo servicio
export const createService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> => {
  try {
    // Limpiamos cualquier propiedad undefined o null
    const cleanedData = Object.fromEntries(
      Object.entries(serviceData).filter(([_, v]) => v != null)
    );
    
    const serviceToSave = {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), serviceToSave);
    
    // Construimos un objeto Service con los datos que acabamos de guardar
    const newService: Service = {
      id: docRef.id,
      ...serviceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newService;
  } catch (error) {
    console.error("Error al crear servicio:", error);
    throw error;
  }
};

// Actualizar servicio existente
export const updateService = async (id: string, serviceData: Partial<Service>): Promise<Service> => {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, id);
    
    // Eliminar propiedades que no queremos actualizar en Firestore
    const { id: _, createdAt, updatedAt, ...dataToUpdate } = serviceData as any;
    
    // Limpiamos cualquier propiedad undefined o null
    const cleanedData = Object.fromEntries(
      Object.entries(dataToUpdate).filter(([_, v]) => v != null)
    );
    
    const updateData = {
      ...cleanedData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(serviceRef, updateData);
    
    // Obtener datos actuales para actualizar
    const currentDoc = await getDoc(serviceRef);
    const currentData = currentDoc.data();
    
    // Construir objeto Service con datos actualizados
    const updatedService: Service = {
      id,
      ...serviceData,
      createdAt: createdAt || currentData?.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return updatedService;
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    throw error;
  }
};

// Eliminar servicio
export const deleteService = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SERVICES_COLLECTION, id));
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    throw error;
  }
};
