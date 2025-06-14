
import { GroupMember } from "@/types";
import GroupMemberCard from "./GroupMemberCard";

interface GroupMembersTabProps {
  members: GroupMember[];
  isUserAdmin: boolean;
  currentUserId?: string;
  onRemoveMember: (member: { id: string; username: string }) => void;
}

const GroupMembersTab = ({ members, isUserAdmin, currentUserId, onRemoveMember }: GroupMembersTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <GroupMemberCard
          key={member.id}
          member={member}
          isUserAdmin={isUserAdmin}
          currentUserId={currentUserId}
          onRemoveMember={onRemoveMember}
        />
      ))}
    </div>
  );
};

export default GroupMembersTab;
