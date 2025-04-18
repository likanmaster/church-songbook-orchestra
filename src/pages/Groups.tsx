
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Search, Music, BookOpen, UserPlus } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Groups = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Datos de ejemplo para grupos
  const [groups] = useState<Group[]>([
    {
      id: "1",
      name: "Equipo de Alabanza",
      description: "Grupo principal de músicos para los servicios dominicales",
      createdAt: "2023-12-01T10:00:00Z",
      updatedAt: "2023-12-10T15:30:00Z",
      createdBy: "1", // ID del usuario creador
      members: [
        { id: "m1", userId: "1", username: "demo", role: "admin", joinedAt: "2023-12-01T10:00:00Z" },
        { id: "m2", userId: "2", username: "Juan", role: "member", joinedAt: "2023-12-02T14:20:00Z" },
        { id: "m3", userId: "3", username: "María", role: "member", joinedAt: "2023-12-03T09:45:00Z" },
      ],
      sharedSongs: ["1", "2", "3"],
      sharedServices: ["1"],
    },
    {
      id: "2",
      name: "Jóvenes",
      description: "Grupo de música para reuniones juveniles",
      createdAt: "2023-12-05T16:20:00Z",
      updatedAt: "2023-12-08T11:10:00Z",
      createdBy: "1", // ID del usuario creador
      members: [
        { id: "m4", userId: "1", username: "demo", role: "admin", joinedAt: "2023-12-05T16:20:00Z" },
        { id: "m5", userId: "4", username: "Pedro", role: "member", joinedAt: "2023-12-06T18:30:00Z" },
      ],
      sharedSongs: ["4", "5"],
      sharedServices: ["2"],
    },
  ]);

  // Filtrar grupos basados en búsqueda
  const filteredGroups = groups.filter((group) => {
    return group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (group.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
  });

  const isUserAdmin = (group: Group) => {
    return group.members.some(member => member.userId === user?.id && member.role === 'admin');
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
                    <span className="text-sm">{group.sharedSongs.length} canciones</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm">{group.sharedServices.length} servicios</span>
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
        
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No se encontraron grupos</h3>
            <p className="text-muted-foreground mb-6">Crea un nuevo grupo para compartir canciones y servicios.</p>
            <Button asChild>
              <Link to="/groups/new">
                <Plus className="mr-2 h-4 w-4" /> Crear Grupo
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Groups;
