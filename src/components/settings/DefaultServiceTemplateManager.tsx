
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, FileText, Save, Trash2, Music, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "@/hooks/use-auth-context";
import { 
  getUserDefaultServiceTemplate, 
  updateUserDefaultServiceTemplate,
  type DefaultServiceTemplate,
  type DefaultServiceTemplateItem 
} from "@/services/user-service";
import { getAllSongs } from "@/services/song-service";
import { Song } from "@/types";
import SongSearch from "@/components/SongSearch";
import { v4 as uuidv4 } from 'uuid';

const DefaultServiceTemplateManager = () => {
  const [template, setTemplate] = useState<DefaultServiceTemplate | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadTemplate();
      loadSongs();
    }
  }, [user]);

  const loadTemplate = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const userTemplate = await getUserDefaultServiceTemplate(user.id);
      setTemplate(userTemplate);
    } catch (error) {
      console.error("Error al cargar plantilla:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la plantilla de servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSongs = async () => {
    if (!user?.id) return;
    
    try {
      const songsData = await getAllSongs(user.id);
      setSongs(songsData);
    } catch (error) {
      console.error("Error al cargar canciones:", error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user?.id || !template) return;
    
    try {
      setIsLoading(true);
      await updateUserDefaultServiceTemplate(user.id, template);
      toast({
        title: "Éxito",
        description: "Plantilla de servicio guardada correctamente",
      });
      setIsEditing(false);
      setShowSongSearch(false);
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla de servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      await updateUserDefaultServiceTemplate(user.id, null);
      setTemplate(null);
      setIsEditing(false);
      setShowSongSearch(false);
      toast({
        title: "Éxito",
        description: "Plantilla de servicio eliminada",
      });
    } catch (error) {
      console.error("Error al eliminar plantilla:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla de servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTemplate = () => {
    const newTemplate: DefaultServiceTemplate = {
      title: "Mi Plantilla de Servicio",
      items: [
        { id: uuidv4(), type: 'section', text: "Inicio del servicio", order: 0 },
        { id: uuidv4(), type: 'section', text: "Primera oración", order: 1 },
        { id: uuidv4(), type: 'section', text: "Tiempo de alabanza", order: 2 },
        { id: uuidv4(), type: 'section', text: "Predicación", order: 3 },
        { id: uuidv4(), type: 'section', text: "Oración final", order: 4 },
        { id: uuidv4(), type: 'section', text: "Fin del servicio", order: 5 }
      ]
    };
    setTemplate(newTemplate);
    setIsEditing(true);
  };

  const addSection = () => {
    if (!template) return;
    
    const newItem: DefaultServiceTemplateItem = {
      id: uuidv4(),
      type: 'section',
      text: "",
      order: template.items.length
    };
    
    setTemplate({
      ...template,
      items: [...template.items, newItem]
    });
  };

  const addSong = (song: Song) => {
    if (!template) return;
    
    const existingSong = template.items.find(item => 
      item.type === 'song' && item.songId === song.id
    );
    
    if (!existingSong) {
      const newItem: DefaultServiceTemplateItem = {
        id: uuidv4(),
        type: 'song',
        songId: song.id,
        order: template.items.length
      };
      
      setTemplate({
        ...template,
        items: [...template.items, newItem]
      });
      setShowSongSearch(false);
    } else {
      toast({
        title: "Advertencia",
        description: "La canción ya está en la plantilla",
      });
    }
  };

  const updateItem = (id: string, newData: Partial<DefaultServiceTemplateItem>) => {
    if (!template) return;
    
    setTemplate({
      ...template,
      items: template.items.map(item =>
        item.id === id ? { ...item, ...newData } : item
      )
    });
  };

  const removeItem = (id: string) => {
    if (!template) return;
    
    setTemplate({
      ...template,
      items: template.items.filter(item => item.id !== id)
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || !template) return;

    const items = Array.from(template.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTemplate({
      ...template,
      items: items.map((item, index) => ({
        ...item,
        order: index,
      }))
    });
  };

  const getSongById = (songId: string) => {
    return songs.find(song => song.id === songId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantilla de Servicio Predeterminada</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Plantilla de Servicio Predeterminada</span>
        </CardTitle>
        <CardDescription>
          Configura una plantilla que se usará automáticamente al crear nuevos servicios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!template ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No tienes una plantilla de servicio configurada
            </p>
            <Button onClick={createNewTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Plantilla
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="template-title">Nombre de la plantilla</Label>
                  <Input
                    id="template-title"
                    value={template.title}
                    onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Elementos del servicio</Label>
                  
                  {showSongSearch && (
                    <div className="mb-4 p-4 border rounded-lg bg-muted">
                      <SongSearch onSelect={addSong} />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowSongSearch(false)}
                        className="mt-2"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                  
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="template-items">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 mt-2"
                        >
                          {template.items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-2 p-2 border rounded bg-background"
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  
                                  <Badge variant="outline" className="min-w-fit">
                                    {index + 1}
                                  </Badge>
                                  
                                  {item.type === 'section' ? (
                                    <>
                                      <FileText className="h-4 w-4 text-green-500" />
                                      <Input
                                        placeholder="Nombre de la sección"
                                        value={item.text || ""}
                                        onChange={(e) => updateItem(item.id, { text: e.target.value })}
                                        className="flex-1"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <Music className="h-4 w-4 text-blue-500" />
                                      <div className="flex-1">
                                        {(() => {
                                          const song = getSongById(item.songId!);
                                          return song ? (
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">{song.title}</span>
                                              {song.key && (
                                                <Badge variant="outline">{song.key}</Badge>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-muted-foreground">Canción no encontrada</span>
                                          );
                                        })()}
                                      </div>
                                    </>
                                  )}
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-500 h-8 w-8"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addSection}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Agregar Sección
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSongSearch(true)}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      Agregar Canción
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveTemplate} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Plantilla
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setShowSongSearch(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Plantilla actual: {template.title}</Label>
                  <div className="mt-2 space-y-1">
                    {template.items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="min-w-fit">
                          {index + 1}
                        </Badge>
                        {item.type === 'section' ? (
                          <>
                            <FileText className="h-4 w-4 text-green-500" />
                            <span>{item.text}</span>
                          </>
                        ) : (
                          <>
                            <Music className="h-4 w-4 text-blue-500" />
                            {(() => {
                              const song = getSongById(item.songId!);
                              return song ? (
                                <div className="flex items-center gap-2">
                                  <span>{song.title}</span>
                                  {song.key && (
                                    <Badge variant="outline" className="text-xs">{song.key}</Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Canción no encontrada</span>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    Editar Plantilla
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteTemplate}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Plantilla
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DefaultServiceTemplateManager;
