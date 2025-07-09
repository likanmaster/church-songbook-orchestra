import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, X, GripVertical, Music, FileText, Shuffle } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
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
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import Navbar from "@/components/layout/Navbar";
import SongSearch from "@/components/SongSearch";
import RandomSongByStyleModal from "@/components/services/RandomSongByStyleModal";
import { Service, ServiceSong, ServiceSection, Song, ServiceGroup } from "@/types";
import { getServiceById, createService, updateService, getAllServiceGroups } from "@/services/service-service";
import { getAllSongs } from "@/services/song-service";
import { getUserDefaultServiceTemplate, getUserMusicStyles } from "@/services/user-service";
import { useAuth } from "@/hooks/use-auth-context";
import { v4 as uuidv4 } from 'uuid';

type ServiceItem = {
  id: string;
  type: 'song' | 'section';
  order: number;
  data: Song & { serviceNotes?: string } | { text: string };
};

const ServiceForm = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [theme, setTheme] = useState("");
  const [preacher, setPreacher] = useState("");
  const [notes, setNotes] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [songsLibrary, setSongsLibrary] = useState<Song[]>([]);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [userMusicStyles, setUserMusicStyles] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: serviceId } = useParams<{ id: string }>();
  const isEditing = !!serviceId;

  useEffect(() => {
    if (user?.id) {
      loadServiceGroups();
      loadSongsLibrary();
      loadUserMusicStyles();
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && serviceId && songsLibrary.length > 0) {
      loadService(serviceId);
    } else if (!isEditing && user?.id) {
      // Al crear un nuevo servicio, cargar la plantilla predeterminada
      loadDefaultTemplate();
    }
  }, [serviceId, isEditing, songsLibrary, user]);

  const loadSongsLibrary = async () => {
    if (!user?.id) return;
    
    try {
      console.log("🎵 [ServiceForm] Cargando biblioteca de canciones...");
      const songs = await getAllSongs(user.id);
      console.log("🎵 [ServiceForm] Canciones cargadas:", songs.length);
      setSongsLibrary(songs);
    } catch (error) {
      console.error("❌ [ServiceForm] Error al cargar canciones:", error);
    }
  };

  const loadServiceGroups = async () => {
    if (!user?.id) return;
    
    try {
      console.log("🏷️ [ServiceForm] Cargando grupos de servicios...");
      const groups = await getAllServiceGroups(user.id);
      console.log("🏷️ [ServiceForm] Grupos cargados:", groups);
      setServiceGroups(groups);
    } catch (error) {
      console.error("❌ [ServiceForm] Error al cargar grupos:", error);
    }
  };

  const loadUserMusicStyles = async () => {
    if (!user?.id) return;
    
    try {
      console.log("🎼 [ServiceForm] Cargando estilos musicales del usuario...");
      const styles = await getUserMusicStyles(user.id);
      console.log("🎼 [ServiceForm] Estilos cargados:", styles);
      setUserMusicStyles(styles);
    } catch (error) {
      console.error("❌ [ServiceForm] Error al cargar estilos musicales:", error);
    }
  };

  const loadDefaultTemplate = async () => {
    if (!user?.id) return;
    
    try {
      console.log("📋 [ServiceForm] Cargando plantilla predeterminada...");
      const template = await getUserDefaultServiceTemplate(user.id);
      
      if (template) {
        console.log("📋 [ServiceForm] Plantilla encontrada:", template);
        const templateItems: ServiceItem[] = [];
        
        for (const templateItem of template.items) {
          if (templateItem.type === 'section') {
            templateItems.push({
              id: `section-${templateItem.id}`,
              type: 'section',
              order: templateItem.order,
              data: { text: templateItem.text || "" }
            });
          } else if (templateItem.type === 'song' && templateItem.songId) {
            // Buscar la canción en la biblioteca
            const song = songsLibrary.find(s => s.id === templateItem.songId);
            if (song) {
              templateItems.push({
                id: `song-${song.id}`,
                type: 'song',
                order: templateItem.order,
                data: { ...song, serviceNotes: "" }
              });
            }
          }
        }
        
        // Ordenar por orden
        templateItems.sort((a, b) => a.order - b.order);
        setServiceItems(templateItems);
      } else {
        console.log("📋 [ServiceForm] No hay plantilla, usando sección por defecto");
        // Si no hay plantilla, usar una sección por defecto
        setServiceItems([{
          id: uuidv4(),
          type: 'section',
          order: 0,
          data: { text: "Inicio del servicio" }
        }]);
      }
    } catch (error) {
      console.error("❌ [ServiceForm] Error al cargar plantilla predeterminada:", error);
      // En caso de error, usar sección por defecto
      setServiceItems([{
        id: uuidv4(),
        type: 'section',
        order: 0,
        data: { text: "Inicio del servicio" }
      }]);
    }
  };

  const loadService = async (id: string) => {
    setIsLoading(true);
    try {
      const service = await getServiceById(id);
      if (service) {
        setTitle(service.title);
        setDate(new Date(service.date));
        setTheme(service.theme || "");
        setPreacher(service.preacher || "");
        setNotes(service.notes || "");
        setGroupId(service.groupId || null);
        
        // Combinar canciones y secciones en una sola lista
        const items: ServiceItem[] = [];
        
        // Agregar canciones con los detalles completos de la biblioteca
        service.songs.forEach((serviceSong, index) => {
          const songDetails = songsLibrary.find(s => s.id === serviceSong.songId);
          if (songDetails) {
            items.push({
              id: `song-${serviceSong.songId}`,
              type: 'song',
              order: serviceSong.order,
              data: {
                ...songDetails,
                serviceNotes: serviceSong.notes,
              }
            });
          }
        });
        
        // Agregar secciones
        service.sections.forEach((section) => {
          items.push({
            id: `section-${section.id}`,
            type: 'section',
            order: section.order,
            data: { text: section.text }
          });
        });
        
        // Ordenar por orden
        items.sort((a, b) => a.order - b.order);
        setServiceItems(items);
      } else {
        toast({
          title: "Error",
          description: "Servicio no encontrado",
          variant: "destructive",
        });
        navigate("/services");
      }
    } catch (error) {
      console.error("Error al cargar el servicio:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un servicio",
        variant: "destructive",
      });
      return;
    }

    if (serviceItems.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un elemento al servicio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("💾 [ServiceForm] Guardando servicio con groupId:", groupId);
      
      // Separar canciones y secciones
      const songs: ServiceSong[] = [];
      const sections: ServiceSection[] = [];
      
      serviceItems.forEach((item, index) => {
        if (item.type === 'song') {
          const songData = item.data as Song & { serviceNotes?: string };
          songs.push({
            id: `${songData.id}-${index}`,
            songId: songData.id,
            order: index,
            notes: songData.serviceNotes || "",
          });
        } else {
          const sectionData = item.data as { text: string };
          sections.push({
            id: item.id.replace('section-', ''),
            text: sectionData.text,
            order: index,
          });
        }
      });
      
      const serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        date: date?.toISOString() || new Date().toISOString(),
        theme: theme || null,
        preacher: preacher || null,
        notes: notes || null,
        groupId: groupId || null,
        songs,
        sections,
        userId: user.id,
        isPublic: false,
        sharedWith: [],
      };

      console.log("💾 [ServiceForm] Datos del servicio a guardar:", serviceData);

      let result;
      if (isEditing && serviceId) {
        result = await updateService(serviceId, serviceData, user.id);
        console.log("✅ [ServiceForm] Servicio actualizado:", result);
      } else {
        result = await createService(serviceData, user.id);
        console.log("✅ [ServiceForm] Servicio creado:", result);
      }

      toast({
        title: "Éxito",
        description: isEditing ? "Servicio actualizado correctamente" : "Servicio creado correctamente",
      });

      navigate("/services");
    } catch (error) {
      console.error("❌ [ServiceForm] Error al guardar el servicio:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSong = (song: Song) => {
    const existingSong = serviceItems.find(item => 
      item.type === 'song' && (item.data as Song).id === song.id
    );
    
    if (!existingSong) {
      const newItem: ServiceItem = {
        id: `song-${song.id}`,
        type: 'song',
        order: serviceItems.length,
        data: { ...song, serviceNotes: "" }
      };
      setServiceItems([...serviceItems, newItem]);
      setShowSongSearch(false);
    } else {
      toast({
        title: "Advertencia",
        description: "La canción ya está en el servicio",
      });
    }
  };

  const addSection = () => {
    const newItem: ServiceItem = {
      id: `section-${uuidv4()}`,
      type: 'section',
      order: serviceItems.length,
      data: { text: "" }
    };
    setServiceItems([...serviceItems, newItem]);
  };

  const createRandomService = () => {
    if (songsLibrary.length === 0) {
      toast({
        title: "Error",
        description: "No hay canciones disponibles para crear un servicio aleatorio",
        variant: "destructive",
      });
      return;
    }

    if (serviceItems.length === 0) {
      toast({
        title: "Error",
        description: "No hay elementos en el servicio. Agrega algunas secciones primero",
        variant: "destructive",
      });
      return;
    }

    const newItems: ServiceItem[] = [];
    let order = 0;

    // Obtener solo las secciones existentes
    const existingSections = serviceItems.filter(item => item.type === 'section');
    
    if (existingSections.length === 0) {
      toast({
        title: "Error",
        description: "No hay secciones en el servicio",
        variant: "destructive",
      });
      return;
    }

    // Intercalar secciones existentes con canciones aleatorias
    for (let i = 0; i < existingSections.length; i++) {
      // Agregar la sección existente
      newItems.push({
        ...existingSections[i],
        order: order++
      });

      // Agregar canción aleatoria después de cada sección (excepto la última)
      if (i < existingSections.length - 1) {
        const randomSong = songsLibrary[Math.floor(Math.random() * songsLibrary.length)];
        newItems.push({
          id: `song-${randomSong.id}-${order}`,
          type: 'song',
          order: order++,
          data: { ...randomSong, serviceNotes: "" }
        });
      }
    }

    setServiceItems(newItems);
    toast({
      title: "Servicio creado",
      description: `Se ha creado un servicio aleatorio con ${newItems.length} elementos`,
    });
  };

  const updateItem = (id: string, newData: any) => {
    setServiceItems(serviceItems.map(item => 
      item.id === id ? { ...item, data: { ...item.data, ...newData } } : item
    ));
  };

  const removeItem = (id: string) => {
    setServiceItems(serviceItems.filter(item => item.id !== id));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(serviceItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setServiceItems(
      items.map((item, index) => ({
        ...item,
        order: index,
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando servicio...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{isEditing ? "Editar Servicio" : "Nuevo Servicio"}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda - Contenido del Servicio */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenido del Servicio</CardTitle>
                <CardDescription>
                  Agrega canciones y secciones para organizar tu servicio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="service-items">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 mb-4"
                      >
                        {serviceItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-3 p-3 bg-secondary rounded-md"
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                
                                <div className="flex-1">
                                  {item.type === 'song' ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Music className="h-4 w-4 text-blue-500" />
                                        <span className="font-medium">{(item.data as Song).title}</span>
                                        {(item.data as Song).key && (
                                          <Badge variant="outline">{(item.data as Song).key}</Badge>
                                        )}
                                      </div>
                                      <Input
                                        placeholder="Notas para esta canción..."
                                        value={(item.data as Song & { serviceNotes?: string }).serviceNotes || ""}
                                        onChange={(e) => updateItem(item.id, { serviceNotes: e.target.value })}
                                        className="text-sm h-8"
                                      />
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-muted-foreground">Sección</span>
                                      </div>
                                      <Input
                                        placeholder="Nombre de la sección (ej: Bienvenida, Ofrenda, etc.)"
                                        value={(item.data as { text: string }).text}
                                        onChange={(e) => updateItem(item.id, { text: e.target.value })}
                                        className="text-sm h-8"
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-full text-red-500 hover:bg-red-100"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará este elemento
                                        del servicio permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction onClick={() => removeItem(item.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Button type="button" variant="outline" size="sm" onClick={addSection}>
                    <FileText className="mr-2 h-4 w-4" />
                    Agregar Sección
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowSongSearch(true)}>
                    <Music className="mr-2 h-4 w-4" />
                    Agregar Canción
                  </Button>
                  <RandomSongByStyleModal
                    songs={songsLibrary}
                    userMusicStyles={userMusicStyles}
                    onSongSelect={addSong}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={createRandomService}>
                    <Shuffle className="mr-2 h-4 w-4" />
                    Crear Servicio Aleatorio
                  </Button>
                </div>

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
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha - Información Básica */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Servicio</CardTitle>
                <CardDescription>
                  Detalles básicos del servicio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <DatePicker
                    id="date"
                    value={date}
                    onValueChange={setDate}
                  />
                </div>
                
                <div>
                  <Label htmlFor="theme">Tema (opcional)</Label>
                  <Input
                    type="text"
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="preacher">Predicador (opcional)</Label>
                  <Input
                    type="text"
                    id="preacher"
                    value={preacher}
                    onChange={(e) => setPreacher(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="group">Grupo de Servicio (opcional)</Label>
                  <Select value={groupId || "none"} onValueChange={(value) => {
                    console.log("📋 [ServiceForm] Seleccionando grupo:", value);
                    setGroupId(value === "none" ? null : value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin grupo</SelectItem>
                      {serviceGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: group.color }}
                            />
                            {group.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                  {isLoading ? "Guardando..." : "Guardar Servicio"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceForm;
