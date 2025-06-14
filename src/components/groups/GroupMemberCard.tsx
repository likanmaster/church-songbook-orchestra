
import { GroupMember } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface GroupMemberCardProps {
  member: GroupMember;
  isUserAdmin: boolean;
  currentUserId?: string;
  onRemoveMember: (member: { id: string; username: string }) => void;
}

const GroupMemberCard = ({ member, isUserAdmin, currentUserId, onRemoveMember }: GroupMemberCardProps) => {
  return (
    <Card>
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
          
          {isUserAdmin && member.userId !== currentUserId && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={() => onRemoveMember({ id: member.id, username: member.username })}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupMemberCard;
