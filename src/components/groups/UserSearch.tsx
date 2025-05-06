
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  DocumentData,
  serverTimestamp
} from "firebase/firestore";
import { db, USERS_COLLECTION } from "@/hooks/use-auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth-context";

interface User {
  id: string;
  username: string;
}

interface UserSearchProps {
  currentUserId: string | undefined;
  selectedUserIds: string[];
  onAddUser: (user: User) => void;
  groupName?: string;
  groupId?: string;
}

const UserSearch = ({ 
  currentUserId, 
  selectedUserIds, 
  onAddUser, 
  groupName, 
  groupId 
}: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async (searchText: string) => {
    if (searchText.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const usersCollection = collection(db, USERS_COLLECTION);
      // Búsqueda por nombre de usuario - using template literals instead of String concatenation
      const q = query(
        usersCollection,
        where("username", ">=", searchText),
        where("username", "<=", `${searchText}\uf8ff`)
      );
      
      const querySnapshot = await getDocs(q);
      const results: User[] = [];
      
      querySnapshot.forEach((doc) => {
        // No incluir al usuario actual ni a los usuarios ya seleccionados
        if (doc.id !== currentUserId && !selectedUserIds.includes(doc.id)) {
          const userData = doc.data() as DocumentData;
          results.push({
            id: doc.id,
            username: userData.username as string || "",
          });
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      toast({
        title: "Error",
        description: "No se pudieron buscar usuarios",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = async (selectedUser: User) => {
    // Llamar a la función del componente padre para añadir el usuario
    onAddUser(selectedUser);
    
    // Si estamos en el contexto de un grupo existente (GroupInvite), enviar notificación
    if (groupId && groupName && user) {
      try {
        // Crear una notificación en la colección de notificaciones del usuario invitado
        const notificationId = `invite_${Date.now()}`;
        await setDoc(doc(db, USERS_COLLECTION, selectedUser.id, 'notifications', notificationId), {
          type: 'group_invite',
          groupId: groupId,
          groupName: groupName,
          from: user.username,
          fromId: user.id,
          createdAt: serverTimestamp(),
          read: false
        });
        
        toast({
          title: "Invitación enviada",
          description: `${selectedUser.username} ha sido invitado al grupo`,
        });
      } catch (error) {
        console.error("Error al enviar notificación:", error);
        toast({
          title: "Error",
          description: "No se pudo enviar la invitación",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {isSearching && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
          </div>
        )}
        
        {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
          </div>
        )}
        
        {searchResults.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.username}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAddUser(user)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
