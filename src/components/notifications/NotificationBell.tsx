import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  arrayUnion,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { db, USERS_COLLECTION, GROUPS_COLLECTION } from "@/hooks/use-auth-context";
import { useAuth } from "@/hooks/use-auth-context";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Music, Users, BookOpen } from "lucide-react";

type NotificationType = 'group_invite' | 'new_song' | 'new_service' | 'rehearsal';

type Notification = {
  id: string;
  type: NotificationType;
  groupId: string;
  groupName: string;
  from: string;
  fromId: string;
  createdAt: Timestamp;
  contentId?: string;
  contentName?: string;
  read: boolean;
  date?: string;
  time?: string;
  notes?: string;
};

export const NotificationBell = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Buscar notificaciones del usuario en Firestore
    const notificationsRef = collection(db, USERS_COLLECTION, user.id, 'notifications');
    
    // Ordenar por fecha de creación, más recientes primero
    const q = query(notificationsRef);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({
          id: doc.id,
          type: data.type,
          groupId: data.groupId,
          groupName: data.groupName,
          from: data.from,
          fromId: data.fromId,
          createdAt: data.createdAt,
          contentId: data.contentId,
          contentName: data.contentName,
          read: data.read || false,
          date: data.date,
          time: data.time,
          notes: data.notes
        });
      });
      
      // Ordenar por fecha, más recientes primero
      notifs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setNotifications(notifs);
    });
    
    return () => unsubscribe();
  }, [user?.id]);

  const handleAcceptInvitation = async (notification: Notification) => {
    if (!user?.id) return;

    try {
      // 1. Actualizar el documento del grupo para añadir al usuario
      const groupRef = doc(db, GROUPS_COLLECTION, notification.groupId);
      
      // Crear el nuevo miembro
      const newMember = {
        id: `member_${Date.now()}`,
        userId: user.id,
        username: user.username,
        role: 'member',
        joinedAt: new Date().toISOString(),
      };
      
      await updateDoc(groupRef, {
        members: arrayUnion(newMember)
      });
      
      // 2. Actualizar el documento del usuario para añadir el grupo
      await updateDoc(doc(db, USERS_COLLECTION, user.id), {
        groups: arrayUnion(notification.groupId)
      });
      
      // 3. Eliminar la notificación
      await deleteDoc(doc(db, USERS_COLLECTION, user.id, 'notifications', notification.id));
      
      toast({
        title: "Invitación aceptada",
        description: `Te has unido al grupo ${notification.groupName}`,
      });
      
      // Cerrar el menú
      setIsOpen(false);
    } catch (error) {
      console.error("Error al aceptar invitación:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la invitación",
        variant: "destructive",
      });
    }
  };

  const handleRejectInvitation = async (notification: Notification) => {
    if (!user?.id) return;

    try {
      // Simplemente eliminamos la notificación
      await deleteDoc(doc(db, USERS_COLLECTION, user.id, 'notifications', notification.id));
      
      toast({
        description: "Invitación rechazada",
      });
    } catch (error) {
      console.error("Error al rechazar invitación:", error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la invitación",
        variant: "destructive",
      });
    }
  };

  const handleViewContent = (notification: Notification) => {
    // Marcar como leída
    if (!user?.id) return;

    const notificationRef = doc(db, USERS_COLLECTION, user.id, 'notifications', notification.id);
    updateDoc(notificationRef, { read: true })
      .catch(error => console.error("Error al marcar notificación como leída:", error));
    
    // Navegar según el tipo
    if (notification.type === 'new_song' && notification.contentId) {
      navigate(`/songs/${notification.contentId}`);
    } else if (notification.type === 'new_service' && notification.contentId) {
      navigate(`/services/${notification.contentId}`);
    } else {
      navigate(`/groups/${notification.groupId}`);
    }
    
    // Cerrar el menú
    setIsOpen(false);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'group_invite':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'new_song':
        return <Music className="h-4 w-4 text-green-500" />;
      case 'new_service':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'rehearsal':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'group_invite':
        return (
          <p className="text-sm">
            <span className="font-medium">{notification.from}</span> te ha invitado a unirte 
            al grupo <span className="font-medium">{notification.groupName}</span>
          </p>
        );
      case 'new_song':
        return (
          <p className="text-sm">
            Nueva canción <span className="font-medium">{notification.contentName}</span> añadida 
            al grupo <span className="font-medium">{notification.groupName}</span>
          </p>
        );
      case 'new_service':
        return (
          <p className="text-sm">
            Nuevo servicio <span className="font-medium">{notification.contentName}</span> añadido 
            al grupo <span className="font-medium">{notification.groupName}</span>
          </p>
        );
      case 'rehearsal':
        return (
          <div className="text-sm">
            <p>
              <span className="font-medium">{notification.from}</span> ha programado un ensayo 
              para el grupo <span className="font-medium">{notification.groupName}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              📅 {notification.date} a las {notification.time}
            </p>
            {notification.notes && (
              <p className="text-xs text-muted-foreground mt-1">
                📝 {notification.notes}
              </p>
            )}
          </div>
        );
      default:
        return <p className="text-sm">Notificación</p>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificaciones</span>
          {notifications.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {notifications.length}
            </Badge>
          )}
        </DropdownMenuLabel>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tienes notificaciones nuevas
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4 cursor-default" data-read={notification.read ? 'true' : 'false'}>
              <div className="flex items-start gap-3 w-full">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  {getNotificationText(notification)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.createdAt.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
              
              {notification.type === 'group_invite' ? (
                <div className="mt-2 flex gap-2 self-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRejectInvitation(notification)}
                  >
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvitation(notification)}
                  >
                    Aceptar
                  </Button>
                </div>
              ) : (
                <div className="mt-2 self-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewContent(notification)}
                  >
                    Ver
                  </Button>
                </div>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
