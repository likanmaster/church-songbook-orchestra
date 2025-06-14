
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GroupDeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberToRemove: { id: string; username: string } | null;
  onConfirmRemove: () => void;
}

const GroupDeleteMemberDialog = ({ 
  open, 
  onOpenChange, 
  memberToRemove, 
  onConfirmRemove 
}: GroupDeleteMemberDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar miembro</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar a {memberToRemove?.username} del grupo?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirmRemove}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDeleteMemberDialog;
