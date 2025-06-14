import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Group, Song, ServiceItemType, GroupMessage } from "@/types";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, BookOpen, Clock, Calendar, UserMinus, Share, UserPlus, AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db, GROUPS_COLLECTION, SONGS_COLLECTION, SERVICES_COLLECTION } from "@/hooks/use-auth-context";
import { doc, getDoc, deleteDoc, updateDoc, arrayRemove, serverTimestamp, arrayUnion } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth-context";
import GroupChat from "@/components/groups/GroupChat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; username: string } | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const groupDoc = await getDoc(doc(db, GROUPS_COLLECTION, id));
        
        if (groupDoc.exists()) {
          const groupData = groupDoc.data() as Omit<Group, 'id'>;
          const fetchedGroup = {
            id: groupDoc.id,
            ...groupData,
          } as Group;
          
          setGroup(fetchedGroup);
          
          // Cargar canciones compartidas
          const songsPromises = fetchedGroup.sharedSongs.map(async (songId) => {
            const songDoc = await getDoc(doc(db, SONGS_COLLECTION, songId));
            if (songDoc.exists()) {
              return { id: songDoc.id, ...songDoc.data() } as Song;
            }
            return null;
          });
          
          const fetchedSongs = (await Promise.all(songsPromises)).filter(Boolean) as Song[];
          setSongs(fetchedSongs);
          
          // Cargar servicios compartidos
          const servicesPromises = fetchedGroup.sharedServices.map(async (serviceId) => {
            const serviceDoc = await getDoc(doc(db, SERVICES_COLLECTION, serviceId));
            if (serviceDoc.exists()) {
              return { id: serviceDoc.id, ...serviceDoc.data() };
            }
            return null;
          });
          
          const fetchedServices = (await Promise.all(servicesPromises)).filter(Boolean);
          setServices(fetchedServices);
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
    
    fetchGroupData();
  }, [id, toast, navigate]);
  
  const isUserAdmin = () => {
    if (!group || !user) return false;
    return group.members.some(member => member.userId === user.id && member.role === 'admin');
  };
  
  const isUserMember = () => {
    if (!group || !user) return false;
    return group.members.some(member => member.userId === user.id);
  };
  
  const handleRemoveMember = async () => {
    if (!id || !group || !memberToRemove) return;
    
    try {
      // Solo permitir al administrador eliminar miembros
      if (!isUserAdmin()) {
        toast({
          title: "Error",
          description: "No tienes permisos para eliminar miembros",
          variant: "destructive",
        });
        return;
      }
      
      // Buscar el miembro a eliminar
      const memberToDelete = group.members.find(member => member.id === memberToRemove.id);
      
      if (!memberToDelete) {
        toast({
          title: "Error",
          description: "Miembro no encontrado",
          variant: "destructive",
        });
        return;
      }
      
      // Actualizar el documento del grupo
      const groupRef = doc(db, GROUPS_COLLECTION, id);
      
      // Obtener la lista actualizada de miembros
      const updatedMembers = group.members.filter(member => member.id !== memberToRemove.id);
      
      await updateDoc(groupRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
      
      // Actualizar el estado local
      setGroup({
        ...group,
        members: updatedMembers,
      });
      
      toast({
        title: "Éxito",
        description: `${memberToRemove.username} ha sido eliminado del grupo`,
      });
      
      // Cerrar el diálogo
      setShowDeleteDialog(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error al eliminar al miembro:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar al miembro del grupo",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!id || !group || !user || !messageText.trim()) return;
    
    try {
      setIsSendingMessage(true);
      
      const newMessage: GroupMessage = {
        id: `${Date.now()}_${user.id}`,
        userId: user.id,
        username: user.username,
        message: messageText,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      const groupRef = doc(db, GROUPS_COLLECTION, id);
      
      await updateDoc(groupRef, {
        messages: arrayUnion(newMessage),
        updatedAt: serverTimestamp(),
      });
      
      // Actualizar el estado local
      setGroup(prevGroup => ({
        ...prevGroup!,
        messages: [...(prevGroup?.messages || []), newMessage]
      }));
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
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

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-medium mb-2">Grupo no encontrado</h3>
              <Button asChild className="mt-4">
                <Link to="/groups">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Grupos
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isUserMember()) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-medium mb-2">No eres miembro de este grupo</h3>
              <p className="text-muted-foreground mb-4">
                No tienes acceso a este grupo
              </p>
              <Button asChild className="mt-4">
                <Link to="/groups">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Grupos
                </Link>
              </Button>
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
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{group.name}</h1>
        </div>
        
        <p className="text-muted-foreground mb-6">{group.description}</p>
        
        {isUserAdmin() && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button asChild variant="outline" size="sm">
              <Link to={`/groups/${id}/invite`}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar Miembros
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Compartir Grupo
            </Button>
          </div>
        )}

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Miembros ({group.members.length})
            </TabsTrigger>
            <TabsTrigger value="songs" className="gap-2">
              <Music className="h-4 w-4" />
              Canciones ({songs.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Servicios ({services.length})
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat ({group.messages?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6 pb-4">
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
                      
                      {isUserAdmin() && member.userId !== user?.id && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => {
                            setMemberToRemove({ id: member.id, username: member.username });
                            setShowDeleteDialog(true);
                          }}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="songs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.length > 0 ? (
                songs.map((song) => (
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
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No hay canciones compartidas</h3>
                  <p className="text-muted-foreground">
                    Este grupo aún no tiene canciones compartidas
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.length > 0 ? (
                services.map((service) => (
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
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No hay servicios compartidos</h3>
                  <p className="text-muted-foreground">
                    Este grupo aún no tiene servicios compartidos
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <GroupChat
              groupId={id!}
              messages={group.messages || []}
              onSendMessage={handleSendMessage}
              isLoading={isSendingMessage}
            />
          </TabsContent>
        </Tabs>
        
        {/* Diálogo de confirmación para eliminar miembro */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar miembro</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar a {memberToRemove?.username} del grupo?
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRemoveMember}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default GroupDetail;
