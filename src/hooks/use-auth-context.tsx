
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser, 
  updateProfile 
} from "firebase/auth";
import { toast } from "sonner";
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "@/types";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeVkiKsixEC0ul57riSN7T9j6cbiZQugg",
  authDomain: "cancionero-2eb05.firebaseapp.com",
  projectId: "cancionero-2eb05",
  storageBucket: "cancionero-2eb05.appspot.com",
  messagingSenderId: "687796217784",
  appId: "1:687796217784:web:aa758a409c782237da514d",
  measurementId: "G-3GL2VSH7T5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

// Colección de usuarios en Firestore
export const USERS_COLLECTION = 'users';
export const SONGS_COLLECTION = 'songs';
export const SERVICES_COLLECTION = 'services';
export const GROUPS_COLLECTION = 'groups';

// Habilitar persistencia offline para mejor experiencia de usuario
try {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Persistencia no habilitada: múltiples pestañas abiertas');
      } else if (err.code === 'unimplemented') {
        console.warn('El navegador no soporta persistencia offline');
      }
    });
} catch (error) {
  console.error("Error al configurar persistencia:", error);
}

type AuthContextType = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para obtener datos de usuario desde Firestore
  const getUserData = async (uid: string): Promise<User | null> => {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: userDoc.id,
          email: userData.email || "",
          username: userData.username || "",
          createdAt: userData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          updatedAt: userData.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
          photoURL: userData.photoURL,
          songs: userData.songs || [],
          groups: userData.groups || [],
          idpersonal: userData.idpersonal
        };
      }
      return null;
    } catch (error) {
      console.error("Error al obtener datos de usuario:", error);
      return null;
    }
  };

  // Monitor authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        // Obtener o crear datos de usuario en Firestore
        let userData = await getUserData(fbUser.uid);
        
        if (!userData) {
          // Si no existe el documento, inicializamos los datos de usuario
          userData = {
            id: fbUser.uid,
            email: fbUser.email || "",
            username: fbUser.displayName || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            songs: [],
            groups: []
          };
          
          // Crear documento de usuario en Firestore
          try {
            await setDoc(doc(db, USERS_COLLECTION, fbUser.uid), {
              email: fbUser.email,
              username: fbUser.displayName,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              songs: [],
              groups: []
            });
          } catch (error) {
            console.error("Error al crear documento de usuario:", error);
          }
        }
        
        setUser(userData);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Inicio de sesión exitoso");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const errorMessage = (error as Error).message;
      toast.error(`Error al iniciar sesión: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with username
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      // Crear documento de usuario en Firestore
      await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), {
        email: email,
        username: username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        songs: [],
        groups: []
      });
      
      toast.success("Cuenta creada exitosamente");
    } catch (error) {
      console.error("Error al registrar:", error);
      const errorMessage = (error as Error).message;
      toast.error(`Error al registrar: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      const errorMessage = (error as Error).message;
      toast.error(`Error al cerrar sesión: ${errorMessage}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
