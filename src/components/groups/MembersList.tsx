
import { Shield, UserMinus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface GroupMember {
  id: string;
  username: string;
  role: "admin" | "member";
}

interface MembersListProps {
  members: GroupMember[];
  onToggleRole: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
}

const MembersList = ({ members, onToggleRole, onRemoveMember }: MembersListProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium mb-2">Miembros seleccionados:</h3>
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no has seleccionado ningún miembro</p>
      ) : (
        members.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium block">{user.username}</span>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Administrador" : "Miembro"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleRole(user.id)}
                >
                  <Shield className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveMember(user.id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default MembersList;
