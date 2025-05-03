
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, Save, Plus, X, Clock, Music, FileText, Move, ArrowLeft, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"; 
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import { toast } from "sonner";
import { Song, Service, ServiceItemType, ServiceSongItem, ServiceSectionItem } from "@/types";
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Importamos los servicios de Firebase
import { getServiceById, createService, updateService } from "@/services/service-service";
import { getAllSongs } from "@/services/song-service";

interface ServiceFormValues {
  title: string;
  date: Date | undefined;
  theme: string;
  preacher: string;
  notes: string;
}

const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceItems, setServiceItems] = useState<ServiceItemType[]>([]);
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionText, setSectionText] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      title: "",
      date: new Date(),
      theme: "",
      preacher: "",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar todas las canciones
        const songs = await getAllSongs();
        setAvailableSongs(songs);
        
        // Si estamos editando, cargar el servicio
        if (isEditMode && id) {
          const service = await getServiceById(id);
          
          if (!service) {
            toast.error("Servicio no encontrado");
            navigate("/services");
            return;
          }
          
          form.reset({
            title: service.title,
            date: new Date(service.date),
            theme: service.theme || "",
            preacher: service.preacher || "",
            notes: service.notes || "",
          });
          
          // Convertir servicios a elementos para el UI
          const serviceItemsList: ServiceItemType[] = [];
          
          // Añadir canciones
          service.songs.forEach(serviceSong => {
            const songDetails = songs.find(s => s.id === serviceSong.songId);
            
            if (songDetails) {
              const songItem: ServiceSongItem = {
                type: 'song',
                data: {
                  ...songDetails,
                  order: serviceSong.order,
                  serviceNotes: serviceSong.notes,
                }
              };
              serviceItemsList.push(songItem);
            }
          });
          
          // Ordenar por el campo order
          serviceItemsList.sort((a, b) => a.data.order - b.data.order);
          setServiceItems(serviceItemsList);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos del servicio");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, navigate, form]);

  const [searchQuery, setSearchQuery] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [songBeingEdited, setSongBeingEdited] = useState<string | null>(null);

  const handleSave = async (data: ServiceFormValues) => {
    setIsSaving(true);
    
    try {
      // Recolectar todas las canciones y secciones de serviceItems
      const songs = serviceItems
        .filter(item => item.type === 'song')
        .map(item => ({
          id: `song-${item.data.id}`,
          songId: item.data.id,
          order: item.data.order,
          notes: item.type === 'song' ? item.data.serviceNotes : undefined
        }));
      
      const serviceData = {
        title: data.title,
        date: data.date ? format(data.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        theme: data.theme,
        preacher: data.preacher,
        notes: data.notes,
        songs
      };
      
      if (isEditMode && id) {
        await updateService(id, serviceData);
        toast.success("Servicio actualizado exitosamente");
        navigate(`/services/${id}`);
      } else {
        await createService(serviceData);
        toast.success("Servicio creado exitosamente");
        navigate("/services");
      }
    } catch (error) {
      console.error("Error al guardar el servicio:", error);
      toast.error("Error al guardar el servicio");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSong = (song: Song) => {
    const newItem: ServiceSongItem = {
      type: 'song',
      data: { 
        ...song, 
        order: serviceItems.length + 1,
        serviceNotes: notesInput 
      }
    };
    
    setServiceItems([...serviceItems, newItem]);
    setNotesInput("");
    setSongDialogOpen(false);
  };

  const handleAddSection = () => {
    if (!sectionText.trim()) {
      toast.error("Por favor ingrese un texto para la sección");
      return;
    }
    
    if (editingSectionId) {
      const updatedItems = serviceItems.map(item => 
        (item.type === 'section' && item.data.id === editingSectionId)
          ? { ...item, data: { ...item.data, text: sectionText } }
          : item
      );
      setServiceItems(updatedItems);
      setEditingSectionId(null);
    } else {
      const newItem: ServiceSectionItem = {
        type: 'section',
        data: {
          id: `section-${Date.now()}`,
          text: sectionText,
          order: serviceItems.length + 1
        }
      };
      
      setServiceItems([...serviceItems, newItem]);
    }
    
    setSectionText("");
    setSectionDialogOpen(false);
  };

  const handleEditSection = (id: string, text: string) => {
    setSectionText(text);
    setEditingSectionId(id);
    setSectionDialogOpen(true);
  };

  const handleRemoveItem = (type: 'song' | 'section', id: string) => {
    const newItems = serviceItems.filter(item => 
      !(item.type === type && item.data.id === id)
    );
    
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      data: {
        ...item.data,
        order: index + 1
      }
    })) as ServiceItemType[];
    
    setServiceItems(reorderedItems);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === serviceItems.length - 1)
    ) {
      return;
    }
    
    const newItems = [...serviceItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      data: {
        ...item.data,
        order: idx + 1
      }
    })) as ServiceItemType[];
    
    setServiceItems(reorderedItems);
  };

  const handleUpdateSongNotes = (songId: string, notes: string) => {
    const updatedItems = serviceItems.map(item => 
      (item.type === 'song' && item.data.id === songId)
        ? { ...item, data: { ...item.data, serviceNotes: notes } }
        : item
    ) as ServiceItemType[];
    
    setServiceItems(updatedItems);
    setSongBeingEdited(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(serviceItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const reorderedItems = items.map((item, index) => ({
      ...item,
      data: {
        ...item.data,
        order: index + 1
      }
    })) as ServiceItemType[];
    
    setServiceItems(reorderedItems);
    
    toast.success("El orden de las canciones ha sido actualizado.");
  };

  const filteredSongs = availableSongs.filter((song) => {
    const isAlreadySelected = serviceItems.some(item => 
      item.type === 'song' && item.data.id === song.id
    );
    
    if (isAlreadySelected) return false;
    
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (song.author?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    return matchesSearch;
  });

  const calculateTotalDuration = () => {
    const totalSeconds = serviceItems.reduce((acc, item) => {
      if (item.type === 'song') {
        return acc + (item.data.duration || 0);
      }
      return acc;
    }, 0);
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSongCount = () => {
    return serviceItems.filter(item => item.type === 'song').length;
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
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => isEditMode ? navigate(`/services/${id}`) : navigate("/services")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Calendar className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Editar Servicio" : "Nuevo Servicio"}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={() => isEditMode ? navigate(`/services/${id}`) : navigate("/services")}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={form.handleSubmit(handleSave)} 
              disabled={isSaving || !form.watch("title") || !form.watch("date") || serviceItems.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título del Servicio *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Servicio Dominical" 
                              {...field}
                              required
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tema del Servicio</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: La Gracia de Dios" 
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preacher"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Predicador</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nombre del predicador" 
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Adicionales</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Notas sobre el servicio" 
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Contenido del Servicio</h2>
              <div className="flex gap-2">
                <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Añadir Sección
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Añadir texto descriptivo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSectionId ? "Editar Sección" : "Añadir Sección de Texto"}
                      </DialogTitle>
                    </DialogHeader>
                    <Textarea
                      placeholder="Ej: Bienvenida e introducción"
                      value={sectionText}
                      onChange={(e) => setSectionText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <DialogFooter className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSectionDialogOpen(false);
                          setSectionText("");
                          setEditingSectionId(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddSection}>
                        {editingSectionId ? "Actualizar" : "Añadir"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir Canción
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Añadir canción del repertorio</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Seleccionar Canción</DialogTitle>
                    </DialogHeader>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar canciones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                      {filteredSongs.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No se encontraron canciones disponibles</p>
                        </div>
                      ) : (
                        filteredSongs.map((song) => (
                          <div
                            key={song.id}
                            className="mb-2 p-3 border rounded-md hover:bg-accent cursor-pointer"
                            onClick={() => handleAddSong(song)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{song.title}</h3>
                                <p className="text-sm text-muted-foreground">{song.author}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm">{song.key}</span>
                                {song.duration && (
                                  <p className="text-xs text-muted-foreground">
                                    {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")} min
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {song.categories.map((category, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">{category}</Badge>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <FormLabel>Notas para esta canción (opcional)</FormLabel>
                      <Textarea
                        placeholder="Ej: Tocar versículos 1 y 3 solamente"
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {serviceItems.length === 0 ? (
              <Card className="bg-muted">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Music className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">No hay contenido seleccionado</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSectionDialogOpen(true)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Añadir Sección
                    </Button>
                    <Button onClick={() => setSongDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Canción
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="service-items">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {serviceItems.map((item, index) => (
                          <Draggable 
                            key={item.type === 'song' ? `song-${item.data.id}` : `section-${item.data.id}`}
                            draggableId={item.type === 'song' ? `song-${item.data.id}` : `section-${item.data.id}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <Card>
                                  <CardContent className="p-4">
                                    {item.type === 'song' ? (
                                      <>
                                        <div className="flex justify-between items-start">
                                          <div className="flex items-center">
                                            <div 
                                              {...provided.dragHandleProps}
                                              className="mr-2 cursor-grab active:cursor-grabbing"
                                            >
                                              <Move className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3">
                                              {item.data.order}
                                            </div>
                                            <div>
                                              <h3 className="font-medium">{item.data.title}</h3>
                                              <p className="text-sm text-muted-foreground">{item.data.author}</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="text-destructive hover:text-destructive"
                                              onClick={() => handleRemoveItem('song', item.data.id)}
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          <Badge variant="outline" className="bg-secondary">
                                            {item.data.key}
                                          </Badge>
                                          {item.data.duration && (
                                            <Badge variant="outline" className="bg-secondary">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {Math.floor(item.data.duration / 60)}:{String(item.data.duration % 60).padStart(2, "0")} min
                                            </Badge>
                                          )}
                                          {item.data.categories.map((category, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">{category}</Badge>
                                          ))}
                                        </div>
                                        
                                        {songBeingEdited === item.data.id ? (
                                          <div className="mt-2">
                                            <Textarea
                                              placeholder="Notas para esta canción"
                                              value={notesInput}
                                              onChange={(e) => setNotesInput(e.target.value)}
                                              className="text-sm mb-2"
                                            />
                                            <div className="flex justify-end gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  setNotesInput("");
                                                  setSongBeingEdited(null);
                                                }}
                                              >
                                                Cancelar
                                              </Button>
                                              <Button
                                                size="sm"
                                                onClick={() => handleUpdateSongNotes(item.data.id, notesInput)}
                                              >
                                                Guardar
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            {item.data.serviceNotes && (
                                              <div className="mt-2 text-sm italic border-l-2 border-primary pl-2">
                                                {item.data.serviceNotes}
                                              </div>
                                            )}
                                            <Button
                                              variant="link"
                                              size="sm"
                                              className="mt-1 p-0 h-auto"
                                              onClick={() => {
                                                setSongBeingEdited(item.data.id);
                                                setNotesInput(item.data.serviceNotes || "");
                                              }}
                                            >
                                              {item.data.serviceNotes ? "Editar notas" : "Añadir notas"}
                                            </Button>
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-start w-full">
                                          <div 
                                            {...provided.dragHandleProps}
                                            className="mr-2 cursor-grab active:cursor-grabbing mt-1"
                                          >
                                            <Move className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">
                                            {item.data.order}
                                          </div>
                                          <div className="w-full">
                                            <div className="bg-muted p-3 rounded-md">
                                              <p className="whitespace-pre-wrap">{item.data.text}</p>
                                            </div>
                                            <Button
                                              variant="link"
                                              size="sm"
                                              className="mt-1 p-0 h-auto"
                                              onClick={() => handleEditSection(item.data.id, item.data.text)}
                                            >
                                              Editar texto
                                            </Button>
                                          </div>
                                        </div>
                                        
                                        <div className="flex gap-1 ml-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleRemoveItem('section', item.data.id)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-1/2"
                    onClick={() => setSectionDialogOpen(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Añadir Sección
                  </Button>
                  <Button
                    className="w-1/2"
                    onClick={() => setSongDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Canción
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-4">Resumen del Servicio</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Duración total aproximada:</p>
                    <p className="text-xl font-semibold">{calculateTotalDuration()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Canciones:</p>
                    <p className="text-xl font-semibold">{getSongCount()}</p>
                  </div>
                  
                  <Separator />
                  
                  {form.watch("title") && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{form.watch("title")}</p>
                      {form.watch("date") && (
                        <p className="text-sm text-muted-foreground">
                          {format(form.watch("date") as Date, "PPP")}
                        </p>
                      )}
                      {form.watch("theme") && (
                        <p className="text-sm">Tema: {form.watch("theme")}</p>
                      )}
                      {form.watch("preacher") && (
                        <p className="text-sm">Predicador: {form.watch("preacher")}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceForm;
