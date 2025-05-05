
import { db, SERVICES_COLLECTION, USERS_COLLECTION } from "@/hooks/use-auth-context";
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
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

// Convertir datos de Firestore a nuestro modelo Service
const convertFirestoreDataToService = (id: string, data: any): Service => {
  return {
    id,
    title: data.title || "", 
    date: data.date,
    theme: data.theme || null,
    preacher: data.preacher || null,
    notes: data.notes || null,
    songs: data.songs || [],
    createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
    sections: data.sections || [],
    userId: data.userId || "",
    isPublic: data.isPublic || false,
    sharedWith: data.sharedWith || []
  };
};

// Obtener todos los servicios del usuario actual y los compartidos
export const getAllServices = async (userId: string): Promise<Service[]> => {
  try {
    // Simplificando la consulta para evitar necesitar índices compuestos
    const servicesQuery = query(
      collection(db, SERVICES_COLLECTION), 
      where("userId", "==", userId)
      // Eliminando orderBy para evitar necesidad de índice compuesto
    );
    
    const querySnapshot = await getDocs(servicesQuery);
    const userServices = querySnapshot.docs.map(doc => 
      convertFirestoreDataToService(doc.id, doc.data())
    );
    
    // Obtener servicios compartidos con el usuario
    const sharedServicesQuery = query(
      collection(db, SERVICES_COLLECTION),
      where("sharedWith", "array-contains", userId)
    );
    
    const sharedSnapshot = await getDocs(sharedServicesQuery);
    const sharedServices = sharedSnapshot.docs.map(doc => 
      convertFirestoreDataToService(doc.id, doc.data())
    );
    
    // Obtener servicios públicos
    const publicServicesQuery = query(
      collection(db, SERVICES_COLLECTION),
      where("isPublic", "==", true)
    );
    
    const publicSnapshot = await getDocs(publicServicesQuery);
    const publicServices = publicSnapshot.docs
      .filter(doc => doc.data().userId !== userId) // Excluir los propios que ya se obtuvieron
      .map(doc => convertFirestoreDataToService(doc.id, doc.data()));
    
    // Ordenar los servicios por fecha después de obtener todos (más recientes primero)
    const allServices = [...userServices, ...sharedServices, ...publicServices];
    return allServices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
export const createService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Service> => {
  try {
    // Limpiamos cualquier propiedad undefined o null
    const cleanedData = Object.fromEntries(
      Object.entries(serviceData).filter(([_, v]) => v != null)
    );
    
    const serviceToSave = {
      ...cleanedData,
      title: serviceData.title || "", // Ensure title is defined
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), serviceToSave);
    
    // Actualizar el array de servicios del usuario
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      services: arrayUnion(docRef.id),
      updatedAt: serverTimestamp()
    });
    
    // Construimos un objeto Service con los datos que acabamos de guardar
    const newService: Service = {
      id: docRef.id,
      title: serviceData.title || "", // Ensure title is included
      date: serviceData.date,
      theme: serviceData.theme || null,
      preacher: serviceData.preacher || null,
      notes: serviceData.notes || null,
      songs: serviceData.songs || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: serviceData.sections || [],
      userId: userId,
      isPublic: serviceData.isPublic || false,
      sharedWith: serviceData.sharedWith || []
    };
    
    return newService;
  } catch (error) {
    console.error("Error al crear servicio:", error);
    throw error;
  }
};

// Actualizar servicio existente
export const updateService = async (id: string, serviceData: Partial<Service>, userId: string): Promise<Service> => {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, id);
    
    // Verificar que el usuario sea propietario del servicio
    const serviceDoc = await getDoc(serviceRef);
    if (!serviceDoc.exists()) {
      throw new Error("El servicio no existe");
    }
    
    const serviceOwner = serviceDoc.data().userId;
    if (serviceOwner !== userId) {
      throw new Error("No tienes permiso para editar este servicio");
    }
    
    // Eliminar propiedades que no queremos actualizar en Firestore
    const { id: _, createdAt, updatedAt, userId: __, ...dataToUpdate } = serviceData as any;
    
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
    
    // Ensure we have all required fields for the Service type
    const updatedService: Service = {
      id,
      title: serviceData.title !== undefined ? serviceData.title : currentData?.title || "",
      date: serviceData.date !== undefined ? serviceData.date : currentData?.date,
      theme: serviceData.theme !== undefined ? serviceData.theme : (currentData?.theme || null),
      preacher: serviceData.preacher !== undefined ? serviceData.preacher : (currentData?.preacher || null),
      notes: serviceData.notes !== undefined ? serviceData.notes : (currentData?.notes || null),
      songs: serviceData.songs !== undefined ? serviceData.songs : (currentData?.songs || []),
      sections: serviceData.sections !== undefined ? serviceData.sections : (currentData?.sections || []),
      createdAt: createdAt || currentData?.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentData?.userId || userId,
      isPublic: serviceData.isPublic !== undefined ? serviceData.isPublic : currentData?.isPublic || false,
      sharedWith: serviceData.sharedWith !== undefined ? serviceData.sharedWith : currentData?.sharedWith || []
    };
    
    return updatedService;
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    throw error;
  }
};

// Eliminar servicio
export const deleteService = async (id: string, userId: string): Promise<void> => {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, id);
    
    // Verificar que el usuario sea propietario del servicio
    const serviceDoc = await getDoc(serviceRef);
    if (!serviceDoc.exists()) {
      throw new Error("El servicio no existe");
    }
    
    const serviceOwner = serviceDoc.data().userId;
    if (serviceOwner !== userId) {
      throw new Error("No tienes permiso para eliminar este servicio");
    }
    
    await deleteDoc(serviceRef);
    
    // Actualizar el array de servicios del usuario
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      services: arrayRemove(id),
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    throw error;
  }
};
