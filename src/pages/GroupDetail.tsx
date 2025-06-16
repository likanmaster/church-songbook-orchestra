import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Group, Song, GroupMessage } from "@/types";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Users, BookOpen, AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db, GROUPS_COLLECTION, SONGS_COLLECTION, SERVICES_COLLECTION } from "@/hooks/use-auth-context";
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth-context";
import GroupChat from "@/components/groups/GroupChat";
import GroupHeader from "@/components/groups/GroupHeader";
import GroupMembersTab from "@/components/groups/GroupMembersTab";
import GroupSongsTab from "@/components/groups/GroupSongsTab";
import GroupServicesTab from "@/components/groups/GroupServicesTab";
import GroupDeleteMemberDialog from "@/components/groups/GroupDeleteMemberDialog";

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
  
  const handleGroupUpdate = (updatedData: Partial<Group>) => {
    if (group) {
      setGroup({
        ...group,
        ...updatedData,
      });
    }
  };

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
      if (!isUserAdmin()) {
        toast({
          title: "Error",
          description: "No tienes permisos para eliminar miembros",
          variant: "destructive",
        });
        return;
      }
      
      const memberToDelete = group.members.find(member => member.id === memberToRemove.id);
      
      if (!memberToDelete) {
        toast({
          title: "Error",
          description: "Miembro no encontrado",
          variant: "destructive",
        });
        return;
      }
      
      const groupRef = doc(db, GROUPS_COLLECTION, id);
      const updatedMembers = group.members.filter(member => member.id !== memberToRemove.id);
      
      await updateDoc(groupRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
      
      setGroup({
        ...group,
        members: updatedMembers,
      });
      
      toast({
        title: "Éxito",
        description: `${memberToRemove.username} ha sido eliminado del grupo`,
      });
      
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

  const handleRemoveMemberClick = (member: { id: string; username: string }) => {
    setMemberToRemove(member);
    setShowDeleteDialog(true);
  };

  // Verificar si el chat está habilitado
  const isChatEnabled = group?.settings?.chatEnabled ?? true;

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
        <GroupHeader
          group={group}
          isUserAdmin={isUserAdmin()}
          currentUserId={user?.id}
          onGroupUpdate={handleGroupUpdate}
        />

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
            {isChatEnabled && (
              <TabsTrigger value="chat" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat ({group.messages?.length || 0})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <GroupMembersTab
              members={group.members}
              isUserAdmin={isUserAdmin()}
              currentUserId={user?.id}
              onRemoveMember={handleRemoveMemberClick}
            />
          </TabsContent>

          <TabsContent value="songs" className="space-y-4">
            <GroupSongsTab songs={songs} />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <GroupServicesTab services={services} />
          </TabsContent>

          {isChatEnabled && (
            <TabsContent value="chat" className="space-y-4">
              <GroupChat
                groupId={id!}
                messages={group.messages || []}
                onSendMessage={handleSendMessage}
                isLoading={isSendingMessage}
              />
            </TabsContent>
          )}
        </Tabs>
        
        <GroupDeleteMemberDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          memberToRemove={memberToRemove}
          onConfirmRemove={handleRemoveMember}
        />
      </main>
    </div>
  );
};

export default GroupDetail;
