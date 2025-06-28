
import { useState } from "react";
import { Plus, Edit, Trash2, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { ServiceGroup } from "@/types";

interface ServiceGroupManagerProps {
  groups: ServiceGroup[];
  onCreateGroup: (group: Omit<ServiceGroup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateGroup: (id: string, group: Partial<ServiceGroup>) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
}

const ServiceGroupManager = ({ 
  groups, 
  onCreateGroup, 
  onUpdateGroup, 
  onDeleteGroup 
}: ServiceGroupManagerProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ServiceGroup | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6"
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "#3b82f6"
    });
    setEditingGroup(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo es obligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingGroup) {
        await onUpdateGroup(editingGroup.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color
        });
        toast({
          title: "Éxito",
          description: "Grupo actualizado correctamente",
        });
      } else {
        await onCreateGroup({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          userId: ""
        });
        toast({
          title: "Éxito",
          description: "Grupo creado correctamente",
        });
      }
      
      resetForm();
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Error al gestionar grupo:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el grupo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (group: ServiceGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      color: group.color || "#3b82f6"
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteGroup(id);
      toast({
        title: "Éxito",
        description: "Grupo eliminado correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el grupo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Grupos de Servicios</h3>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsCreateOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Editar Grupo" : "Crear Nuevo Grupo"}
              </DialogTitle>
              <DialogDescription>
                {editingGroup 
                  ? "Modifica los datos del grupo de servicios" 
                  : "Crea un nuevo grupo para organizar tus servicios"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Grupo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ej. Servicios de Mayo 2024"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del grupo..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-8 rounded border"
                  />
                  <Badge style={{ backgroundColor: formData.color, color: 'white' }}>
                    Vista previa
                  </Badge>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingGroup ? "Actualizar" : "Crear"} Grupo
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div 
            key={group.id} 
            className="border rounded-lg p-4 space-y-2"
            style={{ borderLeftColor: group.color, borderLeftWidth: '4px' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Folder className="h-4 w-4" style={{ color: group.color }} />
                <h4 className="font-medium">{group.name}</h4>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(group)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará el grupo "{group.name}". Los servicios no se eliminarán, solo se desagruparán.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(group.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground">{group.description}</p>
            )}
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-8">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No tienes grupos de servicios. Crea uno para organizar mejor tus servicios.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceGroupManager;
