
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Share } from "lucide-react";

interface GroupHeaderProps {
  groupId: string;
  groupName: string;
  groupDescription?: string;
  isUserAdmin: boolean;
}

const GroupHeader = ({ groupId, groupName, groupDescription, isUserAdmin }: GroupHeaderProps) => {
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
      
      {isUserAdmin && (
        <div className="flex flex-wrap gap-2 mb-6">
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
        </div>
      )}
    </>
  );
};

export default GroupHeader;
