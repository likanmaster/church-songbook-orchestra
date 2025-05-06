
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
import UserSearch from "@/components/groups/UserSearch";

const GroupInvite = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleInvite = async (newUser: { id: string; username: string }) => {
    if (!id || !group) return;
    
    try {
      // Actualizar el documento del grupo
      const groupRef = doc(db, GROUPS_COLLECTION, id);
      
      // Crear un nuevo miembro
      const newMember = {
        id: `m${Date.now()}`, // ID único para el miembro
        userId: newUser.id,
        username: newUser.username,
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
        description: `${newUser.username} ha sido añadido al grupo`,
      });
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

        <div className="grid gap-4">
          {group && (
            <UserSearch 
              currentUserId={user?.id}
              selectedUserIds={group.members.map(member => member.userId)}
              onAddUser={handleInvite}
              groupId={group.id}
              groupName={group.name}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default GroupInvite;
