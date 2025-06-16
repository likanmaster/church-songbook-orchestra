
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Share } from "lucide-react";
import RehearsalNotificationDialog from "./RehearsalNotificationDialog";
import GroupSettingsDialog from "./GroupSettingsDialog";
import { Group, GroupMember } from "@/types";

interface GroupHeaderProps {
  group: Group;
  isUserAdmin: boolean;
  currentUserId?: string;
  onGroupUpdate: (updatedGroup: Partial<Group>) => void;
  onLeaveGroup?: () => void;
}

const GroupHeader = ({ 
  group,
  isUserAdmin,
  currentUserId,
  onGroupUpdate,
  onLeaveGroup
}: GroupHeaderProps) => {
  // Verificar si el usuario puede enviar notificaciones
  const canSendNotifications = isUserAdmin || (group.settings?.allowMemberNotifications ?? true);

  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{group.name}</h1>
      </div>
      
      <p className="text-muted-foreground mb-6">{group.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Botón de notificar ensayo - según configuración del grupo */}
        {canSendNotifications && (
          <RehearsalNotificationDialog
            groupId={group.id}
            groupName={group.name}
            members={group.members}
            currentUserId={currentUserId}
          />
        )}
        
        {/* Botones solo para administradores */}
        {isUserAdmin && (
          <>
            <Button asChild variant="outline" size="sm">
              <Link to={`/groups/${group.id}/invite`}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar Miembros
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Compartir Grupo
            </Button>
          </>
        )}

        {/* Configuración/Opciones del grupo - visible para todos los miembros */}
        <GroupSettingsDialog
          group={group}
          onGroupUpdate={onGroupUpdate}
          isUserAdmin={isUserAdmin}
          currentUserId={currentUserId}
          onLeaveGroup={onLeaveGroup}
        />
      </div>
    </>
  );
};

export default GroupHeader;
