import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, X, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Service, ServiceSong, ServiceSection, Song } from "@/types";
import { getServiceById, createService, updateService } from "@/services/service-service";
import { useAuth } from "@/hooks/use-auth-context";
import { v4 as uuidv4 } from 'uuid';

const ServiceForm = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [theme, setTheme] = useState("");
  const [preacher, setPreacher] = useState("");
  const [notes, setNotes] = useState("");
  const [songs, setSongs] = useState<
    (Song & { order: number; serviceNotes?: string })[]
  >([]);
  const [sections, setSections] = useState<ServiceSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: serviceId } = useParams<{ id: string }>();
  const isEditing = !!serviceId;

  useEffect(() => {
    if (isEditing && serviceId) {
      loadService(serviceId);
    } else {
      // Inicializar con una sección por defecto al crear un nuevo servicio
      setSections([{ id: uuidv4(), text: "Introducción", order: 0 }]);
    }
  }, [serviceId, isEditing]);

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
        setSongs(
          service.songs
            .sort((a, b) => a.order - b.order)
            .map((serviceSong, index) => ({
              ...serviceSong,
              id: serviceSong.songId, // Asumiendo que serviceSong tiene un songId
              order: index,
              serviceNotes: serviceSong.notes,
            })) as any
        );
        setSections(
          service.sections.sort((a, b) => a.order - b.order).map((section) => ({
            id: section.id,
            text: section.text,
            order: section.order,
          }))
        );
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

    if (songs.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos una canción",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        date: date?.toISOString() || new Date().toISOString(),
        theme: theme || null,
        preacher: preacher || null,
        notes: notes || null,
        songs: songs.map((song, index) => ({
          id: `${song.id}-${index}`,
          songId: song.id,
          order: index,
          notes: song.serviceNotes || "",
        })),
        sections: sections.map((section, index) => ({
          id: section.id,
          text: section.text,
          order: index,
        })),
        userId: user.id,
        isPublic: false, // Default to private
        sharedWith: [], // Empty array initially
      };

      let result;
      if (isEditing && serviceId) {
        result = await updateService(serviceId, serviceData, user.id);
      } else {
        result = await createService(serviceData, user.id);
      }

      toast({
        title: "Éxito",
        description: isEditing ? "Servicio actualizado correctamente" : "Servicio creado correctamente",
      });

      navigate("/services");
    } catch (error) {
      console.error("Error al guardar el servicio:", error);
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
    if (!songs.find((s) => s.id === song.id)) {
      setSongs([...songs, { ...song, order: songs.length }]);
    } else {
      toast({
        title: "Advertencia",
        description: "La canción ya está en el servicio",
      });
    }
  };

  const removeSong = (songId: string) => {
    setSongs(songs.filter((song) => song.id !== songId));
  };

  const addSection = () => {
    setSections([...sections, { id: uuidv4(), text: "", order: sections.length }]);
  };

  const updateSection = (id: string, text: string) => {
    setSections(
      sections.map((section) => (section.id === id ? { ...section, text } : section))
    );
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar el estado con el nuevo orden y las propiedades necesarias
    setSongs(
      items.map((song, index) => ({
        ...song,
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
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar los detalles del servicio" : "Ingrese los detalles del servicio"}</CardTitle>
            <CardDescription>
              Completa el formulario para {isEditing ? "actualizar" : "crear"} un nuevo servicio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Canciones</h3>
              <SongSearch onSelect={addSong} />
              
              {songs.length > 0 && (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="songs">
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {songs.map((song, index) => (
                          <Draggable key={song.id} draggableId={song.id} index={index}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center justify-between p-3 bg-secondary rounded-md"
                              >
                                <div className="flex items-center">
                                  <div {...provided.dragHandleProps} className="cursor-grab mr-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <span className="text-sm">{song.title}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="text"
                                    placeholder="Notas de la canción"
                                    value={song.serviceNotes || ""}
                                    onChange={(e) => {
                                      const newSongs = [...songs];
                                      newSongs[index].serviceNotes = e.target.value;
                                      setSongs(newSongs);
                                    }}
                                    className="max-w-[200px] text-sm"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => removeSong(song.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
            
            <Separator />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Secciones</h3>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Sección
                </Button>
              </div>
              
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-start gap-4">
                    <Textarea
                      placeholder="Contenido de la sección"
                      value={section.text}
                      onChange={(e) => updateSection(section.id, e.target.value)}
                      className="flex-1"
                    />
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
                            Esta acción no se puede deshacer. Se eliminará la sección
                            permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeSection(section.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Servicio"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default ServiceForm;
