import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, Save, Plus, X, Clock, Music, ChevronUp, ChevronDown, Search, ArrowLeft, FileText, Move } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";
import { Song, Service, ServiceItemType, ServiceSongItem, ServiceSectionItem } from "@/types";
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [serviceItems, setServiceItems] = useState<ServiceItemType[]>([]);
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionText, setSectionText] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      title: "",
      date: new Date(),
      theme: "",
      preacher: "",
      notes: "",
    },
  });

  const servicesData: Service[] = [
    {
      id: "1",
      title: "Servicio Dominical",
      date: "2023-12-17",
      theme: "La Gracia de Dios",
      preacher: "Pastor Juan García",
      notes: "Especial de Navidad",
      songs: [
        { id: "s1", songId: "1", order: 1, notes: "Inicio" },
        { id: "s2", songId: "3", order: 2 },
        { id: "s3", songId: "2", order: 3 },
        { id: "s4", songId: "4", order: 4, notes: "Final" },
      ],
      createdAt: "2023-12-10T14:30:00Z",
      updatedAt: "2023-12-14T09:15:00Z",
    },
    {
      id: "2",
      title: "Reunión de Jóvenes",
      date: "2023-12-15",
      theme: "Fe en Acción",
      preacher: "Líder de Jóvenes",
      songs: [
        { id: "s5", songId: "2", order: 1 },
        { id: "s6", songId: "3", order: 2 },
        { id: "s7", songId: "1", order: 3 },
      ],
      createdAt: "2023-12-08T10:20:00Z",
      updatedAt: "2023-12-08T10:20:00Z",
    },
    {
      id: "3",
      title: "Culto de Oración",
      date: "2023-12-13",
      theme: "Intercesión",
      songs: [
        { id: "s8", songId: "4", order: 1 },
        { id: "s9", songId: "1", order: 2 },
      ],
      createdAt: "2023-12-11T16:45:00Z",
      updatedAt: "2023-12-12T08:30:00Z",
    },
  ];

  const [availableSongs] = useState<Song[]>([
    {
      id: "1",
      title: "Amazing Grace",
      author: "John Newton",
      key: "G",
      tempo: 70,
      style: "Himno",
      duration: 240,
      categories: ["Adoración", "Clásicos"],
      tags: ["gracia", "redención"],
      isFavorite: true,
      createdAt: "2023-01-15T10:30:00Z",
      updatedAt: "2023-01-15T10:30:00Z"
    },
    {
      id: "2",
      title: "How Great is Our God",
      author: "Chris Tomlin",
      key: "C",
      tempo: 80,
      style: "Contemporáneo",
      duration: 300,
      categories: ["Alabanza"],
      tags: ["adoración", "majestad"],
      isFavorite: false,
      createdAt: "2023-02-10T14:45:00Z",
      updatedAt: "2023-02-10T14:45:00Z"
    },
    {
      id: "3",
      title: "10,000 Reasons",
      author: "Matt Redman",
      key: "E",
      tempo: 72,
      style: "Contemporáneo",
      duration: 330,
      categories: ["Adoración", "Contemporáneo"],
      tags: ["alabanza", "adoración"],
      isFavorite: true,
      createdAt: "2023-03-05T09:20:00Z",
      updatedAt: "2023-03-05T09:20:00Z"
    },
    {
      id: "4",
      title: "Dios Incomparable",
      author: "Marcos Witt",
      key: "D",
      tempo: 65,
      style: "Alabanza",
      duration: 270,
      categories: ["Alabanza", "Español"],
      tags: ["adoración", "majestad"],
      isFavorite: false,
      createdAt: "2023-04-20T16:30:00Z",
      updatedAt: "2023-04-20T16:30:00Z"
    },
  ]);

  useEffect(() => {
    if (isEditMode) {
      const loadService = async () => {
        setIsLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const service = servicesData.find(s => s.id === id);
          if (!service) {
            toast({
              title: "Error",
              description: "Servicio no encontrado",
              variant: "destructive",
            });
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
          
          const serviceSongs = service.songs.map(serviceSong => {
            const songDetails = availableSongs.find(s => s.id === serviceSong.songId);
            if (!songDetails) return null;
            
            const songItem: ServiceSongItem = {
              type: 'song',
              data: {
                ...songDetails,
                order: serviceSong.order,
                serviceNotes: serviceSong.notes,
              }
            };
            return songItem;
          }).filter(Boolean) as ServiceItemType[];
          
          serviceSongs.sort((a, b) => a.data.order - b.data.order);
          setServiceItems(serviceSongs);
        } catch (error) {
          toast({
            title: "Error",
            description: "Error al cargar los datos del servicio",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      loadService();
    }
  }, [id, isEditMode, form, navigate, availableSongs]);

  const [searchQuery, setSearchQuery] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [songBeingEdited, setSongBeingEdited] = useState<string | null>(null);

  const handleSave = (data: ServiceFormValues) => {
    console.log("Form data:", data);
    console.log("Service items:", serviceItems);
    
    if (isEditMode) {
      toast({
        title: "Servicio actualizado",
        description: "El servicio ha sido actualizado exitosamente.",
      });
      navigate(`/services/${id}`);
    } else {
      toast({
        title: "Servicio guardado",
        description: "El servicio ha sido guardado exitosamente.",
      });
      navigate("/services");
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
      toast({
        title: "Texto vacío",
        description: "Por favor ingrese un texto para la sección",
        variant: "destructive",
      });
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
    
    toast({
      title: "Orden actualizado",
      description: "El orden de las canciones ha sido actualizado.",
    });
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
            >
              Cancelar
            </Button>
            <Button 
              onClick={form.handleSubmit(handleSave)} 
              disabled={!form.watch("title") || !form.watch("date") || serviceItems.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar
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
                    <p className="text-sm text-muted-
