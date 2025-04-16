import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, X, Plus, Save } from "lucide-react";
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
import Navbar from "@/components/layout/Navbar";

const SongForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [key, setKey] = useState("");
  const [tempo, setTempo] = useState("");
  const [style, setStyle] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
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
  
  const handleSave = () => {
    // En una implementación real, aquí guardaríamos la canción
    // Por ahora solo redirigimos a la página de canciones
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Music className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">Nueva Canción</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/songs")}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                    <FormField
                      name="title"
                      render={() => (
                        <FormItem>
                          <FormLabel>Título de la Canción *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ingresa el título de la canción" 
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              required
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      name="author"
                      render={() => (
                        <FormItem>
                          <FormLabel>Autor / Compositor</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nombre del autor" 
                              value={author}
                              onChange={(e) => setAuthor(e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      name="lyrics"
                      render={() => (
                        <FormItem>
                          <FormLabel>Letra</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ingresa la letra de la canción" 
                              rows={10}
                              value={lyrics}
                              onChange={(e) => setLyrics(e.target.value)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        name="key"
                        render={() => (
                          <FormItem>
                            <FormLabel>Tonalidad</FormLabel>
                            <Select value={key} onValueChange={setKey}>
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
                        name="tempo"
                        render={() => (
                          <FormItem>
                            <FormLabel>Tempo (BPM)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ej: 80" 
                                value={tempo}
                                onChange={(e) => setTempo(e.target.value)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        name="style"
                        render={() => (
                          <FormItem>
                            <FormLabel>Estilo Musical</FormLabel>
                            <Select value={style} onValueChange={setStyle}>
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
                        name="duration"
                        render={() => (
                          <FormItem>
                            <FormLabel>Duración (segundos)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ej: 240 (4 minutos)" 
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                              />
                            </FormControl>
                            <FormDescription>
                              {duration ? `${Math.floor(Number(duration) / 60)}:${String(Number(duration) % 60).padStart(2, "0")} minutos` : ""}
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      name="notes"
                      render={() => (
                        <FormItem>
                          <FormLabel>Notas Adicionales</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Instrucciones especiales o notas para recordar" 
                              rows={4}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
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
                  name="favorite"
                  render={() => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Marcar como favorita</FormLabel>
                        <FormDescription>
                          Agrega esta canción a tus favoritos
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={isFavorite}
                          onCheckedChange={() => setIsFavorite(!isFavorite)}
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
      </main>
    </div>
  );
};

export default SongForm;
