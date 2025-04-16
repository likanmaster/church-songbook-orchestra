
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Save, Plus, X, Clock, Music, ChevronUp, ChevronDown, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"; 
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import { Song } from "@/types";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

// Define the form values interface
interface ServiceFormValues {
  title: string;
  date: Date | undefined;
  theme: string;
  preacher: string;
  notes: string;
}

const ServiceForm = () => {
  const navigate = useNavigate();
  const [selectedSongs, setSelectedSongs] = useState<(Song & { order: number; serviceNotes?: string })[]>([]);
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  
  // Initialize the form
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      title: "",
      date: new Date(),
      theme: "",
      preacher: "",
      notes: "",
    },
  });
  
  // Datos de ejemplo para las canciones disponibles
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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [songBeingEdited, setSongBeingEdited] = useState<string | null>(null);
  
  const handleSave = (data: ServiceFormValues) => {
    // En una implementación real, aquí guardaríamos el servicio
    // con los datos del formulario y las canciones seleccionadas
    console.log("Form data:", data);
    console.log("Selected songs:", selectedSongs);
    
    // Mostrar una notificación de éxito
    toast({
      title: "Servicio guardado",
      description: "El servicio ha sido guardado exitosamente.",
    });
    
    // Redirigir a la página de servicios
    navigate("/services");
  };
  
  const handleAddSong = (song: Song) => {
    setSelectedSongs([
      ...selectedSongs, 
      { 
        ...song, 
        order: selectedSongs.length + 1,
        serviceNotes: notesInput 
      }
    ]);
    setNotesInput("");
    setSongDialogOpen(false);
  };
  
  const handleRemoveSong = (songId: string) => {
    const newSongs = selectedSongs.filter(s => s.id !== songId);
    // Reordenar las canciones restantes
    const reorderedSongs = newSongs.map((song, index) => ({
      ...song,
      order: index + 1
    }));
    setSelectedSongs(reorderedSongs);
  };
  
  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === selectedSongs.length - 1)
    ) {
      return;
    }
    
    const newSongs = [...selectedSongs];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Intercambiar posiciones
    [newSongs[index], newSongs[newIndex]] = [newSongs[newIndex], newSongs[index]];
    
    // Actualizar orden
    const reorderedSongs = newSongs.map((song, idx) => ({
      ...song,
      order: idx + 1
    }));
    
    setSelectedSongs(reorderedSongs);
  };
  
  const handleUpdateSongNotes = (songId: string, notes: string) => {
    const updatedSongs = selectedSongs.map(song => 
      song.id === songId ? { ...song, serviceNotes: notes } : song
    );
    setSelectedSongs(updatedSongs);
    setSongBeingEdited(null);
  };
  
  // Filtrar canciones disponibles basadas en búsqueda
  const filteredSongs = availableSongs.filter((song) => {
    const isAlreadySelected = selectedSongs.some(s => s.id === song.id);
    if (isAlreadySelected) return false;
    
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (song.author?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    return matchesSearch;
  });
  
  const calculateTotalDuration = () => {
    const totalSeconds = selectedSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">Nuevo Servicio</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/services")}>
              Cancelar
            </Button>
            <Button 
              onClick={form.handleSubmit(handleSave)} 
              disabled={!form.watch("title") || !form.watch("date") || selectedSongs.length === 0}
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
              <h2 className="text-xl font-bold">Canciones del Servicio</h2>
              <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Canción
                  </Button>
                </DialogTrigger>
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
            
            {selectedSongs.length === 0 ? (
              <Card className="bg-muted">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Music className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">No hay canciones seleccionadas</p>
                  <Button onClick={() => setSongDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Primera Canción
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {selectedSongs.map((song, index) => (
                  <Card key={song.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3">
                            {song.order}
                          </div>
                          <div>
                            <h3 className="font-medium">{song.title}</h3>
                            <p className="text-sm text-muted-foreground">{song.author}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveSong(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveSong(index, 'down')}
                            disabled={index === selectedSongs.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveSong(song.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="bg-secondary">
                          {song.key}
                        </Badge>
                        {song.duration && (
                          <Badge variant="outline" className="bg-secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")} min
                          </Badge>
                        )}
                        {song.categories.map((category, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{category}</Badge>
                        ))}
                      </div>
                      
                      {songBeingEdited === song.id ? (
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
                              onClick={() => handleUpdateSongNotes(song.id, notesInput)}
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {song.serviceNotes && (
                            <div className="mt-2 text-sm italic border-l-2 border-primary pl-2">
                              {song.serviceNotes}
                            </div>
                          )}
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-1 p-0 h-auto"
                            onClick={() => {
                              setSongBeingEdited(song.id);
                              setNotesInput(song.serviceNotes || "");
                            }}
                          >
                            {song.serviceNotes ? "Editar notas" : "Añadir notas"}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSongDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Otra Canción
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-4">Resumen del Servicio</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Título</p>
                    <p className="font-medium">{form.watch("title") || "No definido"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {form.watch("date") ? format(form.watch("date"), "PPP") : "No definido"}
                    </p>
                  </div>
                  
                  {form.watch("theme") && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tema</p>
                      <p className="font-medium">{form.watch("theme")}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Canciones</p>
                    <p className="font-medium">{selectedSongs.length} canciones seleccionadas</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Duración Total</p>
                    <p className="font-medium">{calculateTotalDuration()} minutos</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={form.handleSubmit(handleSave)}
                      disabled={!form.watch("title") || !form.watch("date") || selectedSongs.length === 0}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Servicio
                    </Button>
                  </div>
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
