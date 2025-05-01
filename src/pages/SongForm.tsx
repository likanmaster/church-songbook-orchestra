import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Music, X, Plus, Save, Pencil, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import SongView from "@/components/songs/SongView";
import { Song } from "@/types";
import ChordButtonGroup from "@/components/songs/ChordButtonGroup";

const SongForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [mode, setMode] = useState<"edit" | "view">(id ? "view" : "edit");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [song, setSong] = useState<Song | null>(null);
  const isNewSong = !id;
  const lyricsTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Crear el form usando useForm
  const form = useForm({
    defaultValues: {
      title: "",
      author: "",
      lyrics: "",
      key: "",
      tempo: "",
      style: "",
      duration: "",
      notes: "",
      isFavorite: false
    }
  });

  // Función para insertar acordes en la posición del cursor
  const insertChordAtCursor = (chord: string) => {
    const textarea = lyricsTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const textBefore = text.substring(0, start);
    const textAfter = text.substring(end);
    
    const newText = `${textBefore}[${chord}]${textAfter}`;
    
    // Actualizamos el valor en el formulario
    form.setValue("lyrics", newText);
    
    // Colocamos el cursor después del acorde insertado
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + chord.length + 2; // +2 por los corchetes
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Cargar datos de ejemplo para demostración
  useEffect(() => {
    if (id) {
      // En una aplicación real, aquí obtendrías los datos de la canción desde una API
      const demoSongs: Song[] = [
        {
          id: "1",
          title: "Amazing Grace",
          author: "John Newton",
          lyrics: "Amazing [G] grace how [D] sweet the [Em] sound\nThat [G] saved a [D] wretch like [C] me\nI [G] once was [D] lost but [Em] now am [D] found\nWas [G] blind but [D] now I [G] see",
          key: "G",
          tempo: 70,
          style: "Himno",
          duration: 240,
          notes: "Cantar con reverencia",
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
          lyrics: "The [C] splendor of the [G] King\n[Am] Clothed in [F] majesty\nLet [C] all the earth [G] rejoice\n[Am] All the earth [F] rejoice",
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
      ];

      const foundSong = demoSongs.find(s => s.id === id);
      if (foundSong) {
        setSong(foundSong);
        form.reset({
          title: foundSong.title,
          author: foundSong.author || "",
          lyrics: foundSong.lyrics || "",
          key: foundSong.key || "",
          tempo: foundSong.tempo?.toString() || "",
          style: foundSong.style || "",
          duration: foundSong.duration?.toString() || "",
          notes: foundSong.notes || "",
          isFavorite: foundSong.isFavorite
        });
        setSelectedCategories(foundSong.categories || []);
        setTags(foundSong.tags || []);
      }
    }
  }, [id, form]);
  
  // Datos de ejemplo
  const categories = [
    { id: "1", name: "Alabanza" },
    { id: "2", name: "Adoración" },
    { id: "3", name: "Contemporáneo" },
    { id: "4", name: "Clásicos" },
    { id: "5", name: "Español" },
    { id: "6", name: "Juventud" },
  ];
  
  const keyOptions = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const styleOptions = ["Contemporáneo", "Himno", "Gospel", "Balada", "Rock", "Pop", "Acústico", "Coral"];
  
  const handleSave = (values: any) => {
    // Preparar los datos completos de la canción
    const updatedSong: Partial<Song> = {
      ...values,
      categories: selectedCategories,
      tags,
      tempo: values.tempo ? parseInt(values.tempo) : undefined,
      duration: values.duration ? parseInt(values.duration) : undefined,
    };
    
    // En una implementación real, aquí guardaríamos la canción
    console.log("Form values:", updatedSong);
    
    toast.success(isNewSong ? "Canción creada con éxito" : "Canción actualizada con éxito");
    
    // Redirigimos a la página de canciones
    navigate("/songs");
  };
  
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Construir el objeto de canción para el modo de vista
  const viewSong: Song = {
    id: id || "new",
    title: form.getValues("title") || "Nueva Canción",
    author: form.getValues("author"),
    lyrics: form.getValues("lyrics"),
    key: form.getValues("key"),
    tempo: form.getValues("tempo") ? parseInt(form.getValues("tempo")) : undefined,
    style: form.getValues("style"),
    duration: form.getValues("duration") ? parseInt(form.getValues("duration")) : undefined,
    notes: form.getValues("notes"),
    categories: selectedCategories,
    tags,
    isFavorite: form.getValues("isFavorite"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center">
            <Music className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">{isNewSong ? "Nueva Canción" : song?.title || "Canción"}</h1>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            {!isNewSong && (
              <Tabs value={mode} onValueChange={(value) => setMode(value as "edit" | "view")}>
                <TabsList>
                  <TabsTrigger value="view">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Lectura
                  </TabsTrigger>
                  <TabsTrigger value="edit">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            <Button variant="ghost" onClick={() => navigate("/songs")}>
              Cancelar
            </Button>
            {mode === "edit" && (
              <Button onClick={form.handleSubmit(handleSave)}>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            )}
          </div>
        </div>
        
        {mode === "view" ? (
          // Modo de lectura
          <SongView song={viewSong} />
        ) : (
          // Modo de edición
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título de la Canción *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ingresa el título de la canción" 
                                    {...field}
                                    required
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Autor / Compositor</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Nombre del autor" 
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lyrics"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>Letra</FormLabel>
                                  <div className="text-xs text-muted-foreground">
                                    Usa [acorde] para insertar acordes
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <ChordButtonGroup onInsertChord={insertChordAtCursor} />
                                  
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Ingresa la letra de la canción con acordes entre corchetes: [C] [G] [Am]" 
                                      rows={10}
                                      {...field}
                                      ref={lyricsTextareaRef}
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="key"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tonalidad</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tonalidad" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {keyOptions.map((k) => (
                                        <SelectItem key={k} value={k}>{k}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="tempo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tempo (BPM)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="Ej: 80" 
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="style"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Estilo Musical</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona estilo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {styleOptions.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duración (segundos)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="Ej: 240 (4 minutos)" 
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {field.value ? `${Math.floor(Number(field.value) / 60)}:${String(Number(field.value) % 60).padStart(2, "0")} minutos` : ""}
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notas Adicionales</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Instrucciones especiales o notas para recordar" 
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <FormField
                        control={form.control}
                        name="isFavorite"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Marcar como favorita</FormLabel>
                              <FormDescription>
                                Agrega esta canción a tus favoritos
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Categorías</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className={`p-2 rounded-md cursor-pointer border transition-colors ${
                              selectedCategories.includes(category.name)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary border-transparent hover:border-primary/50"
                            }`}
                            onClick={() => handleCategoryToggle(category.name)}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                      
                      {selectedCategories.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((category) => (
                              <Badge key={category} variant="outline">{category}</Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Etiquetas</h3>
                      
                      <div className="flex items-center mb-4">
                        <Input
                          placeholder="Nueva etiqueta"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          className="flex-grow"
                          onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                        />
                        <Button
                          type="button"
                          size="icon"
                          onClick={handleAddTag}
                          className="ml-2"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} className="flex items-center gap-1 px-3 py-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </Form>
        )}
      </main>
    </div>
  );
};

export default SongForm;
