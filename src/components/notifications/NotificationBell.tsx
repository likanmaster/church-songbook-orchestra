
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type Invitation = {
  id: string;
  groupId: string;
  groupName: string;
  from: string;
};

export const NotificationBell = () => {
  const { toast } = useToast();
  // Mock data - replace with real data from your backend
  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: "1",
      groupId: "group1",
      groupName: "Grupo de Adoración",
      from: "Carlos",
    },
  ]);

  const handleAccept = (invitation: Invitation) => {
    // Here you would handle the acceptance logic
    setInvitations(invitations.filter((inv) => inv.id !== invitation.id));
    toast({
      title: "Invitación aceptada",
      description: `Te has unido al grupo ${invitation.groupName}`,
    });
  };

  const handleReject = (invitation: Invitation) => {
    // Here you would handle the rejection logic
    setInvitations(invitations.filter((inv) => inv.id !== invitation.id));
    toast({
      description: "Invitación rechazada",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {invitations.length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        {invitations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tienes notificaciones nuevas
          </div>
        ) : (
          invitations.map((invitation) => (
            <DropdownMenuItem key={invitation.id} className="flex flex-col items-start p-4">
              <p className="text-sm">
                <span className="font-medium">{invitation.from}</span> te ha invitado
                a unirte al grupo <span className="font-medium">{invitation.groupName}</span>
              </p>
              <div className="mt-2 flex gap-2 self-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReject(invitation)}
                >
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation)}
                >
                  Aceptar
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
