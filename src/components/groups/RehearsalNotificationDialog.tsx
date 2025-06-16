
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, USERS_COLLECTION } from "@/hooks/use-auth-context";
import { GroupMember } from "@/types";

interface RehearsalNotificationDialogProps {
  groupId: string;
  groupName: string;
  members: GroupMember[];
  currentUserId?: string;
}

const RehearsalNotificationDialog = ({ 
  groupId, 
  groupName, 
  members, 
  currentUserId 
}: RehearsalNotificationDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = async () => {
    if (!date || !time) {
      toast({
        title: "Error",
        description: "Por favor completa la fecha y hora del ensayo",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);

      // Obtener información del usuario actual para el nombre
      const currentUser = members.find(member => member.userId === currentUserId);
      const fromUsername = currentUser?.username || "Administrador";

      // Crear notificación para cada miembro (excepto el administrador actual)
      const notificationPromises = members
        .filter(member => member.userId !== currentUserId)
        .map(async (member) => {
          const notificationRef = collection(db, USERS_COLLECTION, member.userId, 'notifications');
          
          return addDoc(notificationRef, {
            type: 'rehearsal',
            groupId: groupId,
            groupName: groupName,
            from: fromUsername,
            fromId: currentUserId,
            date: date,
            time: time,
            notes: notes || '',
            createdAt: serverTimestamp(),
            read: false
          });
        });

      await Promise.all(notificationPromises);

      toast({
        title: "Notificación enviada",
        description: `Se ha enviado la notificación de ensayo a ${members.length - 1} miembros`,
      });

      // Limpiar formulario y cerrar modal
      setDate("");
      setTime("");
      setNotes("");
      setOpen(false);
    } catch (error) {
      console.error("Error al enviar notificación:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Notificar Ensayo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notificar Ensayo al Grupo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ej: Traer instrumentos, ensayar canciones específicas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              Se notificará a {members.length - 1} miembros
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSendNotification}
                disabled={isSending}
              >
                {isSending ? "Enviando..." : "Enviar Notificación"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RehearsalNotificationDialog;
