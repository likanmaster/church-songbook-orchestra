import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, UserPlus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { db, GROUPS_COLLECTION, USERS_COLLECTION } from "@/hooks/use-auth-context";
import { getDocs, doc, getDoc, updateDoc, arrayUnion, collection, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth-context";
import { Group, User } from "@/types";

const GroupInvite = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return;
      
      try {
        const groupDoc = await getDoc(doc(db, GROUPS_COLLECTION, id));
        if (groupDoc.exists()) {
          const groupData = groupDoc.data() as Omit<Group, 'id'>;
          setGroup({
            id: groupDoc.id,
            ...groupData,
          } as Group);
          
          // Verificar si el usuario es administrador
          const isAdmin = groupData.members.some(
            (member) => member.userId === user?.id && member.role === 'admin'
          );
          
          if (!isAdmin) {
            toast({
              title: "Error",
              description: "No tienes permisos para invitar miembros a este grupo",
              variant: "destructive",
            });
            navigate(`/groups/${id}`);
          }
        } else {
          toast({
            title: "Error",
            description: "Grupo no encontrado",
            variant: "destructive",
          });
          navigate('/groups');
        }
      } catch (error) {
        console.error("Error al cargar el grupo:", error);
        toast({
          title: "Error",
          description: "Error al cargar la información del grupo",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroup();
  }, [id, user, toast, navigate]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([]);
        return;
      }
      
      try {
        const usersCollection = collection(db, USERS_COLLECTION);
        // Búsqueda por nombre de usuario
        const q = query(
          usersCollection,
          where("username", ">=", searchQuery),
          where("username", "<=", searchQuery + "\uf8ff")
        );
        
        const querySnapshot = await getDocs(q);
        const usersData: User[] = [];
        
        querySnapshot.forEach((doc) => {
          // No incluir al usuario actual ni a los miembros ya existentes
          if (doc.id !== user?.id && !group?.members.some(member => member.userId === doc.id)) {
            const userData = doc.data();
            usersData.push({
              id: doc.id,
              email: userData.email || "",
              username: userData.username || "",
              createdAt: userData.createdAt?.toDate()?.toISOString() || "",
              updatedAt: userData.updatedAt?.toDate()?.toISOString() || "",
            });
          }
        });
        
        setUsers(usersData);
      } catch (error) {
        console.error("Error al buscar usuarios:", error);
      }
    };
    
    searchUsers();
  }, [searchQuery, group, user]);

  const handleInvite = async (userId: string, username: string) => {
    if (!id || !group) return;
    
    try {
      // Actualizar el documento del grupo
      const groupRef = doc(db, GROUPS_COLLECTION, id);
      
      // Crear un nuevo miembro
      const newMember = {
        id: `m${Date.now()}`, // ID único para el miembro
        userId: userId,
        username: username,
        role: 'member' as 'member', // Type assertion to ensure it's the correct literal type
        joinedAt: new Date().toISOString(),
      };
      
      // Añadir el miembro al array de miembros
      await updateDoc(groupRef, {
        members: [...group.members, newMember],
        updatedAt: serverTimestamp(),
      });
      
      // Actualizar el estado local
      setGroup({
        ...group,
        members: [...group.members, newMember],
      });
      
      toast({
        title: "Éxito",
        description: `${username} ha sido añadido al grupo`,
      });
      
      // Eliminar el usuario de la lista de búsqueda
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Error al invitar al usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir al usuario al grupo",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando información del grupo...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/groups/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Invitar Miembros</h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar usuarios por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-4">
          {users.length === 0 && searchQuery.length >= 2 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No se encontraron usuarios</h3>
              <p className="text-muted-foreground">
                Intenta con un término de búsqueda diferente
              </p>
            </div>
          )}
          
          {searchQuery.length < 2 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Buscar usuarios</h3>
              <p className="text-muted-foreground">
                Escribe al menos 2 caracteres para buscar usuarios
              </p>
            </div>
          )}

          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleInvite(user.id, user.username)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GroupInvite;
