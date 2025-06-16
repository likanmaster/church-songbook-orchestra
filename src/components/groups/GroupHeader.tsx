
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Share } from "lucide-react";
import RehearsalNotificationDialog from "./RehearsalNotificationDialog";
import { GroupMember } from "@/types";

interface GroupHeaderProps {
  groupId: string;
  groupName: string;
  groupDescription?: string;
  isUserAdmin: boolean;
  members?: GroupMember[];
  currentUserId?: string;
}

const GroupHeader = ({ 
  groupId, 
  groupName, 
  groupDescription, 
  isUserAdmin,
  members = [],
  currentUserId
}: GroupHeaderProps) => {
  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{groupName}</h1>
      </div>
      
      <p className="text-muted-foreground mb-6">{groupDescription}</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Botón de notificar ensayo - disponible para todos los miembros */}
        <RehearsalNotificationDialog
          groupId={groupId}
          groupName={groupName}
          members={members}
          currentUserId={currentUserId}
        />
        
        {/* Botones solo para administradores */}
        {isUserAdmin && (
          <>
            <Button asChild variant="outline" size="sm">
              <Link to={`/groups/${groupId}/invite`}>
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
      </div>
    </>
  );
};

export default GroupHeader;
