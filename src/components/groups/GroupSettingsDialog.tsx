
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Trash2, MessageSquare, Users, Calendar, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, GROUPS_COLLECTION } from "@/hooks/use-auth-context";
import { Group } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GroupSettingsDialogProps {
  group: Group;
  onGroupUpdate: (updatedGroup: Partial<Group>) => void;
  isUserAdmin: boolean;
  currentUserId?: string;
  onLeaveGroup?: () => void;
}

const GroupSettingsDialog = ({ 
  group, 
  onGroupUpdate, 
  isUserAdmin, 
  currentUserId,
  onLeaveGroup 
}: GroupSettingsDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [groupDescription, setGroupDescription] = useState(group.description || "");
  const [allowMemberNotifications, setAllowMemberNotifications] = useState(group.settings?.allowMemberNotifications ?? true);
  const [chatEnabled, setChatEnabled] = useState(group.settings?.chatEnabled ?? true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);

  const handleSaveSettings = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const groupRef = doc(db, GROUPS_COLLECTION, group.id);
      
      // Data to update in Firestore (with serverTimestamp)
      const firebaseUpdateData = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        settings: {
          allowMemberNotifications,
          chatEnabled,
        },
        updatedAt: serverTimestamp(),
      };

      await updateDoc(groupRef, firebaseUpdateData);

      // Data to update in local state (with string timestamp)
      const localUpdateData: Partial<Group> = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        settings: {
          allowMemberNotifications,
          chatEnabled,
        },
        updatedAt: new Date().toISOString(),
      };

      onGroupUpdate(localUpdateData);

      toast({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado correctamente",
      });

      setOpen(false);
    } catch (error) {
      console.error("Error al actualizar configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearChat = async () => {
    try {
      setIsClearingChat(true);
      const groupRef = doc(db, GROUPS_COLLECTION, group.id);
      
      await updateDoc(groupRef, {
        messages: [],
        updatedAt: serverTimestamp(),
      });

      onGroupUpdate({ 
        messages: [],
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Chat limpiado",
        description: "Todos los mensajes han sido eliminados",
      });
    } catch (error) {
      console.error("Error al limpiar chat:", error);
      toast({
        title: "Error",
        description: "No se pudo limpiar el chat",
        variant: "destructive",
      });
    } finally {
      setIsClearingChat(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUserId) return;

    try {
      setIsLeavingGroup(true);
      const groupRef = doc(db, GROUPS_COLLECTION, group.id);
      
      // Filtrar al usuario actual de los miembros
      const updatedMembers = group.members.filter(member => member.userId !== currentUserId);
      
      await updateDoc(groupRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Has salido del grupo",
        description: "Ya no eres miembro de este grupo",
      });

      // Llamar la función de callback para manejar la salida
      if (onLeaveGroup) {
        onLeaveGroup();
      }

      setOpen(false);
    } catch (error) {
      console.error("Error al salir del grupo:", error);
      toast({
        title: "Error",
        description: "No se pudo salir del grupo",
        variant: "destructive",
      });
    } finally {
      setIsLeavingGroup(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          {isUserAdmin ? "Configuración" : "Opciones"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isUserAdmin ? "Configuración del Grupo" : "Opciones del Grupo"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información básica - solo para administradores */}
          {isUserAdmin && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Nombre del Grupo</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nombre del grupo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="groupDescription">Descripción</Label>
                <Input
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Descripción del grupo (opcional)"
                />
              </div>
            </div>
          )}

          {/* Configuraciones - solo para administradores */}
          {isUserAdmin && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Permisos y Características</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="member-notifications" className="text-sm font-normal">
                      Notificaciones de Ensayo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permitir que cualquier miembro envíe notificaciones
                    </p>
                  </div>
                </div>
                <Switch
                  id="member-notifications"
                  checked={allowMemberNotifications}
                  onCheckedChange={setAllowMemberNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="chat-enabled" className="text-sm font-normal">
                      Chat del Grupo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Habilitar o deshabilitar el chat
                    </p>
                  </div>
                </div>
                <Switch
                  id="chat-enabled"
                  checked={chatEnabled}
                  onCheckedChange={setChatEnabled}
                />
              </div>
            </div>
          )}

          {/* Acciones destructivas */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium text-destructive">Zona de Peligro</h4>
            
            {/* Limpiar chat - solo para administradores */}
            {isUserAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpiar Chat
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Limpiar el chat?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente todos los mensajes del chat del grupo.
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearChat}
                      disabled={isClearingChat}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isClearingChat ? "Limpiando..." : "Limpiar Chat"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Salir del grupo - para miembros no administradores */}
            {!isUserAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir del Grupo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Salir del grupo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro que quieres salir del grupo "{group.name}"? 
                      Perderás acceso a todas las canciones, servicios y mensajes compartidos.
                      Tendrás que ser invitado nuevamente para volver a unirte.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleLeaveGroup}
                      disabled={isLeavingGroup}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isLeavingGroup ? "Saliendo..." : "Salir del Grupo"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Botones de acción - solo para administradores */}
          {isUserAdmin && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSettings}
                disabled={isUpdating}
              >
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsDialog;
