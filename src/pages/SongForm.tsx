import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Music, X, Plus, Save, Pencil, BookOpen, Loader2, Star } from "lucide-react";
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
import RichTextEditor from "@/components/songs/RichTextEditor";
import { 
  getSongById, 
  createSong, 
  updateSong, 
  getAllCategories,
  updateSongPublicStatus,
  updateSongRating
} from "@/services/song-service";
import { getUserMusicStyles } from "@/services/user-service";
import { useAuth } from "@/hooks/use-auth-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define the SongFormData type
interface SongFormData {
  title: string;
  author: string;
  lyrics: string;
  key: string;
  tempo: string;
  style: string;
  duration: string;
  notes: string;
  isFavorite: boolean;
  categories: string;
}

const SongForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"edit" | "view">(id ? "view" : "edit");
  const [newTagInput, setNewTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [isSaving, setIsSaving] = useState(false);
  const [userMusicStyles, setUserMusicStyles] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<"rich" | "simple">("rich");
  const isNewSong = !id;
  const lyricsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  
  // Crear el form usando useForm
  const form = useForm<SongFormData>({
    defaultValues: {
      title: "",
      author: "",
      lyrics: "",
      key: "",
      tempo: "",
      style: "",
      duration: "",
      notes: "",
      isFavorite: false,
      categories: ""
    }
  });
  
  // Cargar datos de Firebase y procesar parámetros URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar estilos musicales del usuario
        if (user) {
          const styles = await getUserMusicStyles(user.id);
          setUserMusicStyles(styles);
        }
        
        // Cargar canción si estamos editando
        if (id) {
          setIsLoading(true);
          const fetchedSong = await getSongById(id);
          
          if (fetchedSong) {
            setSong(fetchedSong);
            form.reset({
              title: fetchedSong.title,
              author: fetchedSong.author || "",
              lyrics: fetchedSong.lyrics || "",
              key: fetchedSong.key || "",
              tempo: fetchedSong.tempo?.toString() || "",
              style: fetchedSong.style || "",
              duration: fetchedSong.duration?.toString() || "",
              notes: fetchedSong.notes || "",
              isFavorite: fetchedSong.isFavorite,
              categories: (fetchedSong.categories || []).join(", ")
            });
            setTags(fetchedSong.tags || []);
          } else {
            toast.error("No se encontró la canción");
            navigate("/songs");
          }
        } else {
          // Procesar parámetros URL para canciones importadas
          const urlTitle = searchParams.get('title');
          const urlLyrics = searchParams.get('lyrics');
          
          if (urlTitle || urlLyrics) {
            // Convertir saltos de línea \n a saltos reales
            const formattedLyrics = urlLyrics ? urlLyrics.replace(/\\n/g, '\n') : '';
            
            form.reset({
              title: urlTitle || "",
              author: "",
              lyrics: formattedLyrics,
              key: "",
              tempo: "",
              style: "",
              duration: "",
              notes: "",
              isFavorite: false,
              categories: ""
            });
            
            console.log("📥 [SongForm] Datos importados cargados:", {
              title: urlTitle,
              lyrics: formattedLyrics
            });
            
            // Mostrar mensaje de confirmación
            toast.success("Canción importada cargada. Revisa los datos antes de guardar.");
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate, form, user, searchParams]);

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
  
  const keyOptions = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  const handleSubmit = async (data: SongFormData) => {
    setIsSaving(true);
    try {
      // Convertir categorías de string a array
      const categoriesArray = data.categories
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);
      
      // Preparar los datos completos de la canción
      const songData: Partial<Song> = {
        ...data,
        categories: categoriesArray,
        tags,
        tempo: data.tempo ? parseInt(data.tempo) : undefined,
        duration: data.duration ? parseInt(data.duration) : undefined,
        userId: user?.id || ''
      };
      
      if (isNewSong) {
        await createSong(songData as Omit<Song, 'id' | 'createdAt' | 'updatedAt'>, user?.id || '');
        toast.success("Canción creada con éxito");
      } else if (id) {
        await updateSong(id, songData, user?.id || '');
        toast.success("Canción actualizada con éxito");
      }
      
      // Redirigimos a la página de canciones
      navigate("/songs");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar la canción");
    } finally {
      setIsSaving(false);
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
    categories: form.getValues("categories")
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0),
    tags,
    isFavorite: form.getValues("isFavorite"),
    createdAt: song?.createdAt || new Date().toISOString(),
    updatedAt: song?.updatedAt || new Date().toISOString(),
    userId: user?.id || '',
    isPublic: song?.isPublic || false,
    sharedWith: song?.sharedWith || [],
    usageCount: song?.usageCount || 0,
    rating: song?.rating || 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando canción...</p>
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
              <Button onClick={form.handleSubmit(handleSubmit)}>
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
            <form onSubmit={form.handleSubmit(handleSubmit)}>
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
                                <FormLabel>Letra</FormLabel>
                                
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
                                  
                                  <div className="text-xs text-muted-foreground">
                                    Usa los botones de acordes o escribe [acorde] para insertar acordes
                                  </div>
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
                                  {userMusicStyles.length > 0 ? (
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
                                        {userMusicStyles.map((style) => (
                                          <SelectItem key={style} value={style}>{style}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <div className="flex flex-col space-y-2">
                                      <div className="p-3 rounded-md border border-dashed border-muted-foreground/25 bg-muted/50">
                                        <p className="text-sm text-muted-foreground text-center">
                                          No tienes estilos musicales configurados
                                        </p>
                                        <Button
                                          type="button"
                                          variant="link"
                                          size="sm"
                                          onClick={() => navigate("/settings")}
                                          className="w-full p-0 h-auto font-normal text-primary"
                                        >
                                          Agrega estilos musicales en la página de ajustes
                                        </Button>
                                      </div>
                                    </div>
                                  )}
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
                      
                      {/* Nuevo switch para visibilidad pública */}
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">Canción pública</Label>
                          <p className="text-sm text-muted-foreground">
                            Permite que otros usuarios encuentren esta canción
                          </p>
                        </div>
                        <Switch 
                          checked={song?.isPublic || false}
                          onCheckedChange={(checked) => {
                            if (id && user) {
                              updateSongPublicStatus(id, checked, user.id)
                                .then(() => {
                                  if (song) {
                                    setSong({...song, isPublic: checked});
                                  }
                                  toast.success(checked ? "Canción hecha pública" : "Canción hecha privada");
                                })
                                .catch(error => {
                                  toast.error("Error al cambiar visibilidad: " + error.message);
                                });
                            }
                          }}
                        />
                      </div>
                      
                      {/* Sistema de puntuación con estrellas */}
                      <div className="rounded-lg border p-4">
                        <Label className="text-base mb-2 block">Puntuación</Label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="text-2xl focus:outline-none"
                              onClick={() => {
                                if (id && user) {
                                  updateSongRating(id, star, user.id)
                                    .then(() => {
                                      if (song) {
                                        setSong({...song, rating: star});
                                      }
                                      toast.success(`Puntuación actualizada: ${star} estrellas`);
                                    })
                                    .catch(error => {
                                      toast.error("Error al actualizar puntuación: " + error.message);
                                    });
                                }
                              }}
                            >
                              {song?.rating && star <= song.rating ? (
                                <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                              ) : (
                                <Star className="h-6 w-6 text-muted-foreground" />
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {song?.rating ? `${song.rating} de 5 estrellas` : "Sin puntuación"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categorías</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: adoración, júbilo, navideña (separadas por comas)"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Ingresa las categorías separadas por comas
                            </FormDescription>
                          </FormItem>
                        )}
                      />
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
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/songs")} 
                  className="mr-2" 
                  type="button"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
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
            </form>
          </Form>
        )}
      </main>
    </div>
  );
};

export default SongForm;
