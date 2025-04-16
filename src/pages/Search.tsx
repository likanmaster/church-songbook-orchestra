
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Filter, Clock, Music, Sliders, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/Navbar";
import { Song, SongFilter } from "@/types";

const SearchPage = () => {
  // Estado para filtros
  const [filters, setFilters] = useState<SongFilter>({
    search: "",
    categories: [],
    minDuration: 0,
    maxDuration: 600, // 10 minutos
    favorite: false,
  });
  
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedTempo, setSelectedTempo] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 600]);
  
  // Datos de ejemplo
  const [songs] = useState<Song[]>([
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
    {
      id: "5",
      title: "What A Beautiful Name",
      author: "Hillsong Worship",
      key: "D",
      tempo: 68,
      style: "Contemporáneo",
      duration: 290,
      categories: ["Adoración"],
      tags: ["jesús", "nombre"],
      isFavorite: true,
      createdAt: "2023-05-12T11:25:00Z",
      updatedAt: "2023-05-12T11:25:00Z"
    },
    {
      id: "6",
      title: "Reckless Love",
      author: "Cory Asbury",
      key: "Bb",
      tempo: 82,
      style: "Contemporáneo",
      duration: 340,
      categories: ["Adoración"],
      tags: ["amor", "gracia"],
      isFavorite: false,
      createdAt: "2023-06-08T09:40:00Z",
      updatedAt: "2023-06-08T09:40:00Z"
    },
    {
      id: "7",
      title: "Agnus Dei",
      author: "Michael W. Smith",
      key: "G",
      tempo: 70,
      style: "Himno Contemporáneo",
      duration: 220,
      categories: ["Adoración", "Clásicos"],
      tags: ["cordero", "santo"],
      isFavorite: true,
      createdAt: "2023-06-22T16:15:00Z",
      updatedAt: "2023-06-22T16:15:00Z"
    },
  ]);

  const categories = [
    "Alabanza",
    "Adoración",
    "Contemporáneo",
    "Clásicos",
    "Español",
    "Juventud",
  ];
  
  const keyOptions = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const styleOptions = ["Contemporáneo", "Himno", "Gospel", "Balada", "Rock", "Pop", "Acústico", "Coral"];
  const tempoOptions = [
    { value: "slow", label: "Lento (< 70 BPM)" },
    { value: "medium", label: "Medio (70-100 BPM)" },
    { value: "fast", label: "Rápido (> 100 BPM)" }
  ];

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    setFilters({ ...filters, categories: updatedCategories });
  };
  
  const handleApplyFilters = () => {
    const updatedFilters: SongFilter = {
      ...filters,
      key: selectedKey || undefined,
      minDuration: durationRange[0],
      maxDuration: durationRange[1],
    };
    
    if (selectedTempo) {
      let tempoRange: { min: number; max: number } | undefined;
      if (selectedTempo === "slow") {
        tempoRange = { min: 0, max: 70 };
      } else if (selectedTempo === "medium") {
        tempoRange = { min: 70, max: 100 };
      } else if (selectedTempo === "fast") {
        tempoRange = { min: 100, max: 999 };
      }
      
      if (tempoRange) {
        updatedFilters.tempo = selectedTempo;
      }
    }
    
    if (selectedStyle) {
      updatedFilters.style = selectedStyle;
    }
    
    setFilters(updatedFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      search: filters.search,
    });
    setSelectedKey("");
    setSelectedTempo("");
    setSelectedStyle("");
    setDurationRange([0, 600]);
  };
  
  // Filtrar canciones basadas en filtros
  const filteredSongs = songs.filter((song) => {
    // Filtrar por búsqueda de texto
    const matchesSearch = !filters.search || 
      song.title.toLowerCase().includes(filters.search.toLowerCase()) || 
      (song.author?.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
      song.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
    // Filtrar por categorías
    const matchesCategories = !filters.categories?.length || 
      filters.categories.some(cat => song.categories.includes(cat));
      
    // Filtrar por tonalidad
    const matchesKey = !filters.key || song.key === filters.key;
    
    // Filtrar por tempo
    let matchesTempo = true;
    if (filters.tempo) {
      if (filters.tempo === "slow") {
        matchesTempo = (song.tempo || 0) < 70;
      } else if (filters.tempo === "medium") {
        matchesTempo = (song.tempo || 0) >= 70 && (song.tempo || 0) <= 100;
      } else if (filters.tempo === "fast") {
        matchesTempo = (song.tempo || 0) > 100;
      }
    }
    
    // Filtrar por estilo
    const matchesStyle = !filters.style || song.style === filters.style;
    
    // Filtrar por duración
    const duration = song.duration || 0;
    const matchesDuration = duration >= (filters.minDuration || 0) && 
                          duration <= (filters.maxDuration || 999);
    
    // Filtrar por favoritos
    const matchesFavorite = !filters.favorite || song.isFavorite;
    
    return matchesSearch && matchesCategories && matchesKey && 
           matchesTempo && matchesStyle && matchesDuration && matchesFavorite;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.key) count++;
    if (filters.tempo) count++;
    if (filters.style) count++;
    if (filters.favorite) count++;
    if (filters.categories?.length) count++;
    if (filters.minDuration !== 0 || filters.maxDuration !== 600) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Buscador de Canciones</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por título, autor o palabras clave..."
              value={filters.search || ""}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[320px] sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <Sliders className="h-5 w-5 mr-2" />
                  Filtros Avanzados
                </SheetTitle>
                <SheetDescription>
                  Encuentra canciones que se ajusten a tus necesidades específicas
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Categorías */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Categorías</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        variant={filters.categories?.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleCategoryToggle(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Tonalidad */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Tonalidad</h3>
                  <Select value={selectedKey} onValueChange={setSelectedKey}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier tonalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier tonalidad</SelectItem>
                      {keyOptions.map((key) => (
                        <SelectItem key={key} value={key}>{key}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Tempo */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Tempo</h3>
                  <Select value={selectedTempo} onValueChange={setSelectedTempo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier tempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier tempo</SelectItem>
                      {tempoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Estilo Musical */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Estilo Musical</h3>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier estilo</SelectItem>
                      {styleOptions.map((style) => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Duración */}
                <div>
                  <div className="flex justify-between mb-3">
                    <h3 className="text-sm font-medium">Duración</h3>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(durationRange[0])} - {formatDuration(durationRange[1])}
                    </span>
                  </div>
                  <Slider
                    value={durationRange}
                    min={0}
                    max={600}
                    step={30}
                    onValueChange={(val) => setDurationRange(val as [number, number])}
                    className="my-6"
                  />
                </div>
                
                {/* Solo Favoritos */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Solo Favoritos</h3>
                    <p className="text-xs text-muted-foreground">Mostrar solo canciones favoritas</p>
                  </div>
                  <Switch
                    checked={filters.favorite || false}
                    onCheckedChange={(checked) => setFilters({ ...filters, favorite: checked })}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleResetFilters}>
                    Restablecer
                  </Button>
                  <SheetClose asChild>
                    <Button onClick={handleApplyFilters}>
                      Aplicar Filtros
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.key && (
              <Badge variant="secondary" className="flex items-center">
                Tonalidad: {filters.key}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setFilters({ ...filters, key: undefined });
                    setSelectedKey("");
                  }}
                />
              </Badge>
            )}
            
            {filters.tempo && (
              <Badge variant="secondary" className="flex items-center">
                Tempo: {tempoOptions.find(t => t.value === filters.tempo)?.label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setFilters({ ...filters, tempo: undefined });
                    setSelectedTempo("");
                  }}
                />
              </Badge>
            )}
            
            {filters.style && (
              <Badge variant="secondary" className="flex items-center">
                Estilo: {filters.style}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setFilters({ ...filters, style: undefined });
                    setSelectedStyle("");
                  }}
                />
              </Badge>
            )}
            
            {(filters.minDuration !== 0 || filters.maxDuration !== 600) && (
              <Badge variant="secondary" className="flex items-center">
                Duración: {formatDuration(filters.minDuration || 0)} - {formatDuration(filters.maxDuration || 600)}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setFilters({ ...filters, minDuration: 0, maxDuration: 600 });
                    setDurationRange([0, 600]);
                  }}
                />
              </Badge>
            )}
            
            {filters.favorite && (
              <Badge variant="secondary" className="flex items-center">
                Solo Favoritos
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, favorite: false })}
                />
              </Badge>
            )}
            
            {filters.categories?.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center">
                {category}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                />
              </Badge>
            ))}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleResetFilters}
            >
              Limpiar todos
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <Card key={song.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{song.title}</CardTitle>
                  {song.isFavorite && (
                    <Badge variant="outline" className="bg-song-100 text-song-700 dark:bg-song-900 dark:text-song-300">
                      ★ Favorito
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{song.author}</p>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  {song.categories.map((category, index) => (
                    <Badge key={index} variant="secondary">{category}</Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-secondary rounded-md p-1.5 text-center">
                    <span className="block text-xs text-muted-foreground">Tonalidad</span>
                    <span className="font-medium">{song.key || "-"}</span>
                  </div>
                  <div className="bg-secondary rounded-md p-1.5 text-center">
                    <span className="block text-xs text-muted-foreground">Tempo</span>
                    <span className="font-medium">{song.tempo || "-"} bpm</span>
                  </div>
                  <div className="bg-secondary rounded-md p-1.5 text-center">
                    <span className="block text-xs text-muted-foreground">Duración</span>
                    <span className="font-medium">
                      {song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button asChild variant="default" className="w-full">
                  <Link to={`/songs/${song.id}`}>
                    <Music className="mr-2 h-4 w-4" />
                    Ver Canción
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {filteredSongs.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No se encontraron canciones</h3>
            <p className="text-muted-foreground mb-6">Intenta con diferentes filtros o términos de búsqueda</p>
            <Button onClick={handleResetFilters}>
              Limpiar Filtros
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
