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
    sharedWith: data.sharedWith || [],
    groupId: data.groupId || null // Asegurar que se incluye groupId
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
export const getServiceById = async (id: string, userId?: string): Promise<Service | null> => {
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
    console.log("💾 [createService] Creando servicio con datos:", serviceData);
    
    // Limpiamos cualquier propiedad undefined o null excepto groupId que puede ser null
    const cleanedData = Object.fromEntries(
      Object.entries(serviceData).filter(([key, value]) => {
        // Permitir groupId como null explícitamente
        if (key === 'groupId') return true;
        return value != null;
      })
    );
    
    const serviceToSave = {
      ...cleanedData,
      title: serviceData.title || "",
      userId: userId,
      groupId: serviceData.groupId, // Asegurar que se incluye groupId (puede ser null)
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log("💾 [createService] Datos finales a guardar:", serviceToSave);
    
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
      title: serviceData.title || "",
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
      sharedWith: serviceData.sharedWith || [],
      groupId: serviceData.groupId || null
    };
    
    console.log("✅ [createService] Servicio creado exitosamente:", newService);
    return newService;
  } catch (error) {
    console.error("❌ [createService] Error al crear servicio:", error);
    throw error;
  }
};

// Actualizar servicio existente
export const updateService = async (id: string, serviceData: Partial<Service>, userId: string): Promise<Service> => {
  try {
    console.log("📝 [updateService] Actualizando servicio:", id, "con datos:", serviceData);
    
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
    
    // Limpiamos cualquier propiedad undefined pero permitimos null para groupId
    const cleanedData = Object.fromEntries(
      Object.entries(dataToUpdate).filter(([key, value]) => {
        if (key === 'groupId') return true; // Permitir groupId null
        return value != null;
      })
    );
    
    const updateData = {
      ...cleanedData,
      updatedAt: serverTimestamp()
    };
    
    console.log("💾 [updateService] Datos finales a actualizar:", updateData);
    
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
      sharedWith: serviceData.sharedWith !== undefined ? serviceData.sharedWith : currentData?.sharedWith || [],
      groupId: serviceData.groupId !== undefined ? serviceData.groupId : (currentData?.groupId || null)
    };
    
    console.log("✅ [updateService] Servicio actualizado exitosamente:", updatedService);
    return updatedService;
  } catch (error) {
    console.error("❌ [updateService] Error al actualizar servicio:", error);
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

// Funciones para gestionar grupos de servicios
const SERVICE_GROUPS_COLLECTION = "serviceGroups";

export const getAllServiceGroups = async (userId: string): Promise<import("@/types").ServiceGroup[]> => {
  try {
    console.log("🔍 [getAllServiceGroups] Iniciando consulta para userId:", userId);
    
    if (!userId) {
      console.warn("⚠️ [getAllServiceGroups] userId está vacío o undefined");
      return [];
    }
    
    const groupsQuery = query(
      collection(db, SERVICE_GROUPS_COLLECTION),
      where("userId", "==", userId)
    );
    
    console.log("📋 [getAllServiceGroups] Query creado, ejecutando...");
    const querySnapshot = await getDocs(groupsQuery);
    console.log("📊 [getAllServiceGroups] Documentos encontrados:", querySnapshot.docs.length);
    
    if (querySnapshot.empty) {
      console.log("📭 [getAllServiceGroups] No se encontraron grupos para este usuario");
      return [];
    }
    
    const groups = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log("📄 [getAllServiceGroups] Procesando documento:", { id: doc.id, data });
      
      return {
        id: doc.id,
        name: data.name,
        description: data.description || undefined,
        color: data.color || "#3b82f6",
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        userId: data.userId
      };
    });
    
    console.log("✅ [getAllServiceGroups] Grupos finales procesados:", groups);
    return groups;
  } catch (error) {
    console.error("❌ [getAllServiceGroups] Error al obtener grupos de servicios:", error);
    console.error("❌ [getAllServiceGroups] Stack trace:", error.stack);
    return [];
  }
};

export const createServiceGroup = async (groupData: Omit<import("@/types").ServiceGroup, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<import("@/types").ServiceGroup> => {
  try {
    console.log("📝 [createServiceGroup] Iniciando creación de grupo");
    console.log("📝 [createServiceGroup] Datos recibidos:", groupData);
    console.log("📝 [createServiceGroup] UserId:", userId);
    
    if (!userId) {
      throw new Error("UserId es requerido para crear un grupo");
    }
    
    const groupToSave = {
      name: groupData.name,
      description: groupData.description || null,
      color: groupData.color || "#3b82f6",
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log("💾 [createServiceGroup] Datos a guardar en Firestore:", groupToSave);
    
    const docRef = await addDoc(collection(db, SERVICE_GROUPS_COLLECTION), groupToSave);
    console.log("✅ [createServiceGroup] Documento creado con ID:", docRef.id);
    
    // Verificar que se guardó correctamente
    const savedDoc = await getDoc(docRef);
    if (savedDoc.exists()) {
      console.log("✅ [createServiceGroup] Verificación: documento existe en Firestore");
      console.log("📄 [createServiceGroup] Datos guardados:", savedDoc.data());
    } else {
      console.error("❌ [createServiceGroup] El documento no se encontró después de crearlo");
    }
    
    const newGroup = {
      id: docRef.id,
      name: groupData.name,
      description: groupData.description,
      color: groupData.color || "#3b82f6",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId
    };
    
    console.log("🎉 [createServiceGroup] Grupo creado exitosamente:", newGroup);
    return newGroup;
  } catch (error) {
    console.error("❌ [createServiceGroup] Error al crear grupo de servicios:", error);
    console.error("❌ [createServiceGroup] Stack trace:", error.stack);
    throw error;
  }
};

export const updateServiceGroup = async (id: string, groupData: Partial<import("@/types").ServiceGroup>, userId: string): Promise<void> => {
  try {
    console.log("📝 [updateServiceGroup] Actualizando grupo:", id, "con datos:", groupData);
    
    const groupRef = doc(db, SERVICE_GROUPS_COLLECTION, id);
    
    // Verificar que el usuario sea propietario del grupo
    const groupDoc = await getDoc(groupRef);
    if (!groupDoc.exists()) {
      throw new Error("El grupo no existe");
    }
    
    const groupOwner = groupDoc.data().userId;
    if (groupOwner !== userId) {
      throw new Error("No tienes permiso para editar este grupo");
    }
    
    const { id: _, createdAt, updatedAt, userId: __, ...dataToUpdate } = groupData as any;
    
    const updateData = {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
    };
    
    console.log("💾 [updateServiceGroup] Actualizando con datos:", updateData);
    await updateDoc(groupRef, updateData);
    console.log("✅ [updateServiceGroup] Grupo actualizado exitosamente");
  } catch (error) {
    console.error("❌ [updateServiceGroup] Error al actualizar grupo de servicios:", error);
    throw error;
  }
};

export const deleteServiceGroup = async (id: string, userId: string): Promise<void> => {
  try {
    console.log("🗑️ [deleteServiceGroup] Eliminando grupo:", id);
    
    const groupRef = doc(db, SERVICE_GROUPS_COLLECTION, id);
    
    // Verificar que el usuario sea propietario del grupo
    const groupDoc = await getDoc(groupRef);
    if (!groupDoc.exists()) {
      throw new Error("El grupo no existe");
    }
    
    const groupOwner = groupDoc.data().userId;
    if (groupOwner !== userId) {
      throw new Error("No tienes permiso para eliminar este grupo");
    }
    
    // Desagrupar todos los servicios de este grupo
    const servicesQuery = query(
      collection(db, SERVICES_COLLECTION),
      where("groupId", "==", id),
      where("userId", "==", userId)
    );
    
    const servicesSnapshot = await getDocs(servicesQuery);
    const updatePromises = servicesSnapshot.docs.map(serviceDoc => 
      updateDoc(serviceDoc.ref, { groupId: null })
    );
    
    await Promise.all(updatePromises);
    console.log("📋 [deleteServiceGroup] Servicios desagrupados:", servicesSnapshot.docs.length);
    
    // Eliminar el grupo
    await deleteDoc(groupRef);
    console.log("✅ [deleteServiceGroup] Grupo eliminado exitosamente");
  } catch (error) {
    console.error("❌ [deleteServiceGroup] Error al eliminar grupo de servicios:", error);
    throw error;
  }
};
