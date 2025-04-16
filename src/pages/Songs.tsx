
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Music, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import { Song } from "@/types";

const Songs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
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
  ]);

  const categories = [
    { id: "1", name: "Alabanza" },
    { id: "2", name: "Adoración" },
    { id: "3", name: "Contemporáneo" },
    { id: "4", name: "Clásicos" },
    { id: "5", name: "Español" },
  ];

  // Filtrar canciones basadas en búsqueda y categoría
  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (song.author?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCategory = !selectedCategory || song.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar canciones
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "author") {
      return (a.author || "").localeCompare(b.author || "");
    } else if (sortBy === "key") {
      return (a.key || "").localeCompare(b.key || "");
    } else {
      return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Biblioteca de Canciones</h1>
          <Button asChild className="mt-4 sm:mt-0">
            <Link to="/songs/new">
              <Plus className="mr-2 h-4 w-4" /> Nueva Canción
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar canciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                  <DropdownMenuRadioItem value="title">Título</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="author">Autor</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="key">Tonalidad</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSongs.map((song) => (
            <Card key={song.id} className="overflow-hidden">
              <CardHeader className="relative pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{song.title}</CardTitle>
                  {song.isFavorite && <Heart className="h-5 w-5 text-song-500 fill-song-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{song.author}</p>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
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
                      {song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}` : "-"}
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
            <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No se encontraron canciones</h3>
            <p className="text-muted-foreground mb-6">Intenta con otra búsqueda o añade nuevas canciones a tu biblioteca.</p>
            <Button asChild>
              <Link to="/songs/new">
                <Plus className="mr-2 h-4 w-4" /> Añadir Canción
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Songs;
