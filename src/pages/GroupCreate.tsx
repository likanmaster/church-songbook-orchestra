
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { db, GROUPS_COLLECTION } from "@/hooks/use-auth-context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { useAuth } from "@/hooks/use-auth-context";
import UserSearch from "@/components/groups/UserSearch";
import MembersList from "@/components/groups/MembersList";
import GroupDetailsForm, { GroupFormData } from "@/components/groups/GroupDetailsForm";

interface GroupMember {
  id: string;
  username: string;
  role: "admin" | "member";
}

const GroupCreate = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddUser = (user: { id: string; username: string }) => {
    setSelectedUsers([...selectedUsers, { ...user, role: "member" }]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const toggleUserRole = (userId: string) => {
    setSelectedUsers(
      selectedUsers.map((user) =>
        user.id === userId
          ? { ...user, role: user.role === "admin" ? "member" : "admin" }
          : user
      )
    );
  };

  const onSubmit = async (data: GroupFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un grupo",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedUsers.length === 0) {
      toast({
        description: "Debes agregar al menos un miembro al grupo",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Crear el grupo en Firestore
      const groupData = {
        name: data.name,
        description: data.description || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.id,
        members: [
          // Añadir al creador como administrador
          {
            id: `m${Date.now()}`,
            userId: user.id,
            username: user.username,
            role: 'admin' as 'admin',
            joinedAt: new Date().toISOString(),
          },
          // Añadir los miembros seleccionados
          ...selectedUsers.map(selected => ({
            id: `m${Date.now()}-${selected.id}`,
            userId: selected.id,
            username: selected.username,
            role: selected.role,
            joinedAt: new Date().toISOString(),
          })),
        ],
        sharedSongs: [],
        sharedServices: [],
      };
      
      const docRef = await addDoc(collection(db, GROUPS_COLLECTION), groupData);
      
      toast({
        title: "Grupo creado",
        description: "El grupo se ha creado exitosamente",
      });
      
      navigate(`/groups/${docRef.id}`);
    } catch (error) {
      console.error("Error al crear el grupo:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el grupo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Crear Grupo</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupDetailsForm onSubmit={onSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Miembros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UserSearch 
                currentUserId={user?.id}
                selectedUserIds={selectedUsers.map(user => user.id)}
                onAddUser={handleAddUser}
              />

              <MembersList 
                members={selectedUsers}
                onToggleRole={toggleUserRole}
                onRemoveMember={handleRemoveUser}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GroupCreate;
