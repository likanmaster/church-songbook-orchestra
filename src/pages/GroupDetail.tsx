import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Group } from "@/types";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, BookOpen, Clock, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const GroupDetail = () => {
  const { id } = useParams();
  
  // Datos de ejemplo - esto se reemplazará con datos reales de la base de datos
  const group: Group = {
    id: "1",
    name: "Equipo de Alabanza",
    description: "Grupo principal de músicos para los servicios dominicales",
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2023-12-10T15:30:00Z",
    createdBy: "1",
    members: [
      { id: "m1", userId: "1", username: "demo", role: "admin", joinedAt: "2023-12-01T10:00:00Z" },
      { id: "m2", userId: "2", username: "Juan", role: "member", joinedAt: "2023-12-02T14:20:00Z" },
      { id: "m3", userId: "3", username: "María", role: "member", joinedAt: "2023-12-03T09:45:00Z" },
    ],
    sharedSongs: ["1", "2", "3"],
    sharedServices: ["1"],
  };

  // Datos de ejemplo para canciones
  const songs = [
    { id: "1", title: "Amazing Grace", author: "John Newton" },
    { id: "2", title: "How Great is Our God", author: "Chris Tomlin" },
    { id: "3", title: "Mighty to Save", author: "Reuben Morgan" },
  ];

  // Datos de ejemplo para servicios
  const services = [
    { id: "1", title: "Servicio Dominical", date: "2024-04-21" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
        </div>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Miembros ({group.members.length})
            </TabsTrigger>
            <TabsTrigger value="songs" className="gap-2">
              <Music className="h-4 w-4" />
              Canciones ({group.sharedSongs.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Servicios ({group.sharedServices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {member.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.username}</h3>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                          {member.role === 'admin' ? 'Administrador' : 'Miembro'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          Miembro desde {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="songs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.map((song) => (
                <Link to={`/songs/${song.id}`} key={song.id}>
                  <Card className="h-full hover:bg-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        {song.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{song.author}</p>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Link to={`/services/${service.id}`} key={service.id}>
                  <Card className="h-full hover:bg-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {service.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4" />
                        {service.date}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetail;
