
import { useParams } from "react-router-dom";
import { Group } from "@/types";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Music, Users, BookOpen } from "lucide-react";
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Ingreso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {member.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.username}
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role === 'admin' ? 'Administrador' : 'Miembro'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="songs" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell>{song.title}</TableCell>
                    <TableCell>{song.author}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.title}</TableCell>
                    <TableCell>{service.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetail;
