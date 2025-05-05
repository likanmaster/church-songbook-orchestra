
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Music, FileText, Save } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Service, Song, ServiceSectionItem, ServiceSongItem } from "@/types";
import { createService, getServiceById, updateService } from "@/services/service-service";
import { useAuth } from "@/hooks/use-auth-context";
import ServicePreviewModal from "@/components/services/ServicePreviewModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getAllSongs } from "@/services/song-service";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import SongSelector from "@/components/services/SongSelector";
import SectionEditor from "@/components/services/SectionEditor";

const serviceFormSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres.",
  }),
  date: z.date(),
  theme: z.string().optional(),
  preacher: z.string().optional(),
  notes: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

const ServiceForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [songsLibrary, setSongsLibrary] = useState<Song[]>([]);
  const [serviceItems, setServiceItems] = useState<(ServiceSongItem | ServiceSectionItem)[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [showSongSheet, setShowSongSheet] = useState(false);
  const [showSectionSheet, setShowSectionSheet] = useState(false);
  const isEditing = !!id;
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      theme: "",
      preacher: "",
      notes: "",
    },
  });

  // Cargar canciones
  useEffect(() => {
    const loadSongs = async () => {
      try {
        if (!user?.id) return;
        const songs = await getAllSongs(user.id);
        setSongsLibrary(songs);
      } catch (error) {
        console.error("Error al cargar canciones:", error);
      }
    };
    
    loadSongs();
  }, [user?.id]);

  // Cargar servicio si estamos editando
  useEffect(() => {
    if (isEditing && id && user?.id) {
      loadService(id);
    }
  }, [isEditing, id, user?.id]);

  const loadService = async (serviceId: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log("Cargando servicio:", serviceId);
      const serviceData = await getServiceById(serviceId, user.id);
      console.log("Servicio cargado:", serviceData);
      
      if (serviceData) {
        // Configurar form
        form.setValue("title", serviceData.title);
        form.setValue("date", new Date(serviceData.date));
        form.setValue("theme", serviceData.theme || "");
        form.setValue("preacher", serviceData.preacher || "");
        form.setValue("notes", serviceData.notes || "");
        
        setCurrentService(serviceData);
        
        // Cargar secciones si existen
        const sectionItems: ServiceSectionItem[] = serviceData.sections?.map(section => ({
          type: 'section',
          data: {
            id: section.id,
            text: section.text,
            order: section.order
          }
        })) || [];
        
        // Cargar canciones si existen y existen en la biblioteca
        if (serviceData.songs && serviceData.songs.length > 0 && songsLibrary.length > 0) {
          const songItems: ServiceSongItem[] = [];
          
          for (const serviceSong of serviceData.songs) {
            const songDetails = songsLibrary.find(s => s.id === serviceSong.songId);
            
            if (songDetails) {
              songItems.push({
                type: 'song',
                data: {
                  ...songDetails,
                  order: serviceSong.order,
                  serviceNotes: serviceSong.notes || ''
                }
              });
            }
          }
          
          // Combinar y ordenar todos los elementos
          const allItems = [...songItems, ...sectionItems].sort((a, b) => {
            const orderA = a.type === 'song' ? a.data.order : a.data.order;
            const orderB = b.type === 'song' ? b.data.order : b.data.order;
            return orderA - orderB;
          });
          
          setServiceItems(allItems);
        } else {
          setServiceItems(sectionItems);
        }
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
        description: "Error al cargar los datos del servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSong = (song: Song) => {
    const maxOrder = serviceItems.length > 0 
      ? Math.max(...serviceItems.map(item => 
          item.type === 'song' ? item.data.order : item.data.order
        )) 
      : 0;
    
    const newSong: ServiceSongItem = {
      type: 'song',
      data: {
        ...song,
        order: maxOrder + 1,
        serviceNotes: ''
      }
    };
    
    setServiceItems([...serviceItems, newSong]);
    setShowSongSheet(false);
  };

  const handleAddSection = (text: string) => {
    const maxOrder = serviceItems.length > 0 
      ? Math.max(...serviceItems.map(item => 
          item.type === 'song' ? item.data.order : item.data.order
        )) 
      : 0;
    
    const newSection: ServiceSectionItem = {
      type: 'section',
      data: {
        id: `section-${Date.now()}`,
        text,
        order: maxOrder + 1
      }
    };
    
    setServiceItems([...serviceItems, newSection]);
    setShowSectionSheet(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(serviceItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Actualizar órdenes
    const updatedItems = items.map((item, index) => {
      if (item.type === 'song') {
        return {
          ...item,
          data: { ...item.data, order: index + 1 }
        };
      } else {
        return {
          ...item,
          data: { ...item.data, order: index + 1 }
        };
      }
    });
    
    setServiceItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...serviceItems];
    newItems.splice(index, 1);
    
    // Re-ordenar
    const updatedItems = newItems.map((item, index) => {
      if (item.type === 'song') {
        return {
          ...item,
          data: { ...item.data, order: index + 1 }
        };
      } else {
        return {
          ...item,
          data: { ...item.data, order: index + 1 }
        };
      }
    });
    
    setServiceItems(updatedItems);
  };

  const handleSubmit = async (data: ServiceFormData) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { title, date, theme, preacher, notes } = data;
      
      // Extraer canciones y secciones
      const songs = serviceItems
        .filter(item => item.type === 'song')
        .map(item => {
          const songData = (item as ServiceSongItem).data;
          return {
            id: `song-${Date.now()}-${songData.id}`,
            songId: songData.id,
            order: songData.order,
            notes: songData.serviceNotes || ''
          };
        });
      
      const sections = serviceItems
        .filter(item => item.type === 'section')
        .map(item => {
          const sectionData = (item as ServiceSectionItem).data;
          return {
            id: sectionData.id,
            text: sectionData.text,
            order: sectionData.order
          };
        });
      
      if (isEditing && id) {
        await updateService(
          id, 
          {
            title,
            date: date.toISOString(),
            theme,
            preacher,
            notes,
            songs,
            sections
          }, 
          user.id
        );
        
        toast({
          title: "Éxito",
          description: "Servicio actualizado correctamente",
        });
      } else {
        await createService(
          {
            title,
            date: date.toISOString(),
            theme,
            preacher,
            notes,
            songs,
            sections,
            userId: user.id,
            isPublic: false,
            sharedWith: []
          }, 
          user.id
        );
        
        toast({
          title: "Éxito",
          description: "Servicio creado correctamente",
        });
      }
      
      navigate("/services");
    } catch (error) {
      console.error("Error al guardar el servicio:", error);
      toast({
        title: "Error",
        description: "Error al guardar el servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    const formData = form.getValues();
    
    // Crear servicio temporal para previsualizarlo
    const previewService: Service = {
      id: id || 'preview',
      title: formData.title,
      date: formData.date.toISOString(),
      theme: formData.theme || '',
      preacher: formData.preacher || '',
      notes: formData.notes || '',
      songs: serviceItems
        .filter(item => item.type === 'song')
        .map(item => {
          const songData = (item as ServiceSongItem).data;
          return {
            id: `preview-${songData.id}`,
            songId: songData.id,
            order: songData.order,
            notes: songData.serviceNotes || ''
          };
        }),
      sections: serviceItems
        .filter(item => item.type === 'section')
        .map(item => {
          const sectionData = (item as ServiceSectionItem).data;
          return {
            id: sectionData.id,
            text: sectionData.text,
            order: sectionData.order
          };
        }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id || '',
    };
    
    setCurrentService(previewService);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? "Editar Servicio" : "Nuevo Servicio"}</h1>
            <p className="text-muted-foreground">
              Completa el formulario para {isEditing ? "editar" : "crear"} un nuevo servicio.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={!form.formState.isValid}
            >
              Previsualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" type="text" placeholder="Título del servicio" {...form.register("title")} />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.getValues("date") && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues("date") ? (
                            format(form.getValues("date"), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center" side="bottom">
                        <Controller
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              className={cn("p-3")}
                            />
                          )}
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.date && (
                      <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <Input id="theme" type="text" placeholder="Tema del servicio" {...form.register("theme")} />
                    {form.formState.errors.theme && (
                      <p className="text-sm text-red-500">{form.formState.errors.theme.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="preacher">Predicador</Label>
                    <Input id="preacher" type="text" placeholder="Predicador del servicio" {...form.register("preacher")} />
                    {form.formState.errors.preacher && (
                      <p className="text-sm text-red-500">{form.formState.errors.preacher.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea id="notes" placeholder="Notas adicionales" {...form.register("notes")} />
                    {form.formState.errors.notes && (
                      <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Elementos del Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="service-items">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3"
                        >
                          {serviceItems.length > 0 ? (
                            serviceItems.map((item, index) => (
                              <Draggable key={item.type === 'song' ? `song-${item.data.id}` : `section-${item.data.id}`} 
                                draggableId={item.type === 'song' ? `song-${item.data.id}` : `section-${item.data.id}`} 
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="p-3 border rounded-md bg-white dark:bg-gray-800 flex items-center justify-between"
                                  >
                                    <div className="flex items-center">
                                      <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                                      {item.type === 'song' ? (
                                        <div>
                                          <div className="font-medium">{item.data.title}</div>
                                          <div className="text-xs text-muted-foreground">{item.data.author || 'Autor desconocido'}</div>
                                        </div>
                                      ) : (
                                        <div className="font-medium italic">{item.data.text}</div>
                                      )}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                                      Eliminar
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No hay elementos en este servicio. Añade canciones o secciones usando los botones de abajo.
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Sheet open={showSongSheet} onOpenChange={setShowSongSheet}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="flex-1" onClick={() => setShowSongSheet(true)}>
                          <Music className="h-4 w-4 mr-2" /> Añadir Canción
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Seleccionar Canción</SheetTitle>
                        </SheetHeader>
                        <div className="py-4">
                          <SongSelector songs={songsLibrary} onSelectSong={handleAddSong} />
                        </div>
                      </SheetContent>
                    </Sheet>
                    
                    <Sheet open={showSectionSheet} onOpenChange={setShowSectionSheet}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="flex-1" onClick={() => setShowSectionSheet(true)}>
                          <FileText className="h-4 w-4 mr-2" /> Añadir Sección
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Agregar Nueva Sección</SheetTitle>
                        </SheetHeader>
                        <div className="py-4">
                          <SectionEditor onAddSection={handleAddSection} />
                        </div>
                      </SheetContent>
                    </Sheet>
                    
                    <Button 
                      type="button"
                      onClick={() => form.handleSubmit(handleSubmit)()}
                      className="w-full mt-3" 
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Guardando..." : "Guardar Servicio"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="hidden lg:block">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Elementos:</span>
                    <span className="font-medium">{serviceItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Canciones:</span>
                    <span className="font-medium">
                      {serviceItems.filter(item => item.type === 'song').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Secciones:</span>
                    <span className="font-medium">
                      {serviceItems.filter(item => item.type === 'section').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {currentService && (
          <ServicePreviewModal
            open={showPreview}
            onClose={() => setShowPreview(false)}
            onSave={() => form.handleSubmit(handleSubmit)()}
            service={currentService}
            songLibrary={songsLibrary.map(song => ({ id: song.id, title: song.title, key: song.key || "C" }))}
          />
        )}
      </main>
    </div>
  );
};

export default ServiceForm;
