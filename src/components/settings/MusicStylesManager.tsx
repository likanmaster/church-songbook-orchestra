
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Music } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";
import { getUserMusicStyles, addMusicStyle, removeMusicStyle, editMusicStyle } from "@/services/user-service";
import { toast } from "sonner";

const MusicStylesManager = () => {
  const { user } = useAuth();
  const [musicStyles, setMusicStyles] = useState<string[]>([]);
  const [newStyle, setNewStyle] = useState('');
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadMusicStyles();
    }
  }, [user]);

  const loadMusicStyles = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const styles = await getUserMusicStyles(user.id);
      setMusicStyles(styles);
    } catch (error) {
      console.error('Error loading music styles:', error);
      toast.error('Error al cargar estilos musicales');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStyle = async () => {
    if (!user || !newStyle.trim()) return;

    try {
      const updatedStyles = await addMusicStyle(user.id, newStyle);
      setMusicStyles(updatedStyles);
      setNewStyle('');
      setIsAddDialogOpen(false);
      toast.success('Estilo musical agregado');
    } catch (error) {
      console.error('Error adding music style:', error);
      toast.error('Error al agregar estilo musical');
    }
  };

  const handleEditStyle = async () => {
    if (!user || !editingStyle || !editValue.trim()) return;

    try {
      const updatedStyles = await editMusicStyle(user.id, editingStyle, editValue);
      setMusicStyles(updatedStyles);
      setEditingStyle(null);
      setEditValue('');
      setIsEditDialogOpen(false);
      toast.success('Estilo musical actualizado');
    } catch (error) {
      console.error('Error editing music style:', error);
      toast.error('Error al editar estilo musical');
    }
  };

  const handleRemoveStyle = async (style: string) => {
    if (!user) return;

    try {
      const updatedStyles = await removeMusicStyle(user.id, style);
      setMusicStyles(updatedStyles);
      toast.success('Estilo musical eliminado');
    } catch (error) {
      console.error('Error removing music style:', error);
      toast.error('Error al eliminar estilo musical');
    }
  };

  const openEditDialog = (style: string) => {
    setEditingStyle(style);
    setEditValue(style);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            <span>Estilos Musicales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando estilos musicales...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          <span>Estilos Musicales</span>
        </CardTitle>
        <CardDescription>
          Gestiona tus estilos musicales personalizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Mis estilos musicales ({musicStyles.length})</Label>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar estilo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar nuevo estilo musical</DialogTitle>
                <DialogDescription>
                  Ingresa el nombre del nuevo estilo musical que quieres agregar.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-style">Nombre del estilo</Label>
                  <Input
                    id="new-style"
                    value={newStyle}
                    onChange={(e) => setNewStyle(e.target.value)}
                    placeholder="Ej: Rock alternativo"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddStyle();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddStyle} disabled={!newStyle.trim()}>
                  Agregar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {musicStyles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {musicStyles.map((style) => (
              <Badge key={style} variant="secondary" className="gap-2 text-sm py-1 px-3">
                <span>{style}</span>
                <div className="flex gap-1">
                  <Edit 
                    className="h-3 w-3 cursor-pointer hover:text-blue-600" 
                    onClick={() => openEditDialog(style)}
                  />
                  <Trash2 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveStyle(style)}
                  />
                </div>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tienes estilos musicales personalizados</p>
            <p className="text-sm">Agrega tu primer estilo musical para comenzar</p>
          </div>
        )}

        {/* Dialog para editar estilo */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar estilo musical</DialogTitle>
              <DialogDescription>
                Modifica el nombre del estilo musical.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-style">Nombre del estilo</Label>
                <Input
                  id="edit-style"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Ej: Rock alternativo"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditStyle();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditStyle} disabled={!editValue.trim()}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MusicStylesManager;
