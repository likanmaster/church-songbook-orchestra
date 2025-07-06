
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Search, Music, BookOpen, UserPlus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import { Group } from "@/types";
import { useAuth } from "@/hooks/use-auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { db, GROUPS_COLLECTION } from "@/hooks/use-auth-context";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Groups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const groupsQuery = query(
          collection(db, GROUPS_COLLECTION),
          where("members", "array-contains-any", [{ userId: user.id }])
        );
        
        // Como la consulta anterior no funciona con array de objetos,
        // obtenemos todos los grupos y filtramos manualmente
        const allGroupsQuery = collection(db, GROUPS_COLLECTION);
        const querySnapshot = await getDocs(allGroupsQuery);
        
        const userGroups: Group[] = [];
        
        querySnapshot.forEach((doc) => {
          const groupData = doc.data();
          // Verificar si el usuario es miembro del grupo
          const isMember = groupData.members.some(
            (member: any) => member.userId === user.id
          );
          
          if (isMember) {
            userGroups.push({
              id: doc.id,
              ...groupData,
              createdAt: groupData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
              updatedAt: groupData.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
            } as Group);
          }
        });
        
        setGroups(userGroups);
      } catch (error) {
        console.error("Error al obtener grupos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los grupos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroups();
  }, [user, toast]);

  // Filtrar grupos basados en búsqueda
  const filteredGroups = groups.filter((group) => {
    return group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (group.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
  });

  const isUserAdmin = (group: Group) => {
    return group.members.some(member => member.userId === user?.id && member.role === 'admin');
  };
  
  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    
    try {
      // Verificar si el usuario es administrador
      if (!isUserAdmin(groupToDelete)) {
        toast({
          title: "Error",
          description: "Solo los administradores pueden eliminar grupos",
          variant: "destructive",
        });
        return;
      }
      
      // Eliminar el grupo
      await deleteDoc(doc(db, GROUPS_COLLECTION, groupToDelete.id));
      
      // Actualizar la lista de grupos
      setGroups(groups.filter(group => group.id !== groupToDelete.id));
      
      toast({
        title: "Grupo eliminado",
        description: "El grupo ha sido eliminado exitosamente",
      });
      
      // Cerrar el diálogo
      setShowDeleteDialog(false);
      setGroupToDelete(null);
    } catch (error) {
      console.error("Error al eliminar el grupo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el grupo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mis Grupos</h1>
          <Button asChild className="mt-4 sm:mt-0">
            <Link to="/groups/new">
              <Plus className="mr-2 h-4 w-4" /> Crear Grupo
            </Link>
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar grupos por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando grupos...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {group.name}
                          {isUserAdmin(group) && (
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                              Admin
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.description}
                        </p>
                      </div>
                      
                      {isUserAdmin(group) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => {
                            setGroupToDelete(group);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{group.members.length} miembros</span>
                    </div>

                    <div className="flex -space-x-2 overflow-hidden mb-4">
                      {group.members.slice(0, 5).map((member) => (
                        <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {group.members.length > 5 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                          +{group.members.length - 5}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Music className="h-4 w-4 text-primary" />
                        <span className="text-sm">{group.sharedSongs?.length || 0} canciones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm">{group.sharedServices?.length || 0} servicios</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-2 pt-2">
                    <Button asChild variant="default" className="w-full">
                      <Link to={`/groups/${group.id}`}>
                        <Users className="mr-2 h-4 w-4" />
                        Ver Grupo
                      </Link>
                    </Button>
                    {isUserAdmin(group) && (
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/groups/${group.id}/invite`}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Invitar Miembros
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {filteredGroups.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No se encontraron grupos</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "No hay grupos que coincidan con tu búsqueda." : "Crea un nuevo grupo para compartir canciones y servicios."}
                </p>
                <Button asChild>
                  <Link to="/groups/new">
                    <Plus className="mr-2 h-4 w-4" /> Crear Grupo
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
        
        {/* Diálogo de confirmación para eliminar grupo */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar grupo</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar el grupo "{groupToDelete?.name}"?
                Esta acción no se puede deshacer y se perderán todas las compartidas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteGroup}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Groups;
