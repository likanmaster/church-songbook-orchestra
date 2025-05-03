
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
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
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
    throw error;
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
    const serviceToSave = {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), serviceToSave);
    
    // Recuperamos el servicio con su nuevo ID
    const newServiceDoc = await getDoc(docRef);
    const newService = convertFirestoreDataToService(docRef.id, newServiceDoc.data() || serviceToSave);
    
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
    
    const updateData = {
      ...serviceData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(serviceRef, updateData);
    
    // Recuperar el servicio actualizado
    const updatedServiceDoc = await getDoc(serviceRef);
    return convertFirestoreDataToService(id, updatedServiceDoc.data());
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
