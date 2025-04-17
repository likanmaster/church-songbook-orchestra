import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Music, 
  Plus, 
  Heart,
  Clock,
  Filter,
  Tag,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Song, Category } from "@/types";
import Navbar from "@/components/layout/Navbar";
import { RandomSongButton } from "@/components/songs/RandomSongButton";

// Dummy data
const songsData: Song[] = [
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
    title: "Your Love Never Fails",
    author: "Jesus Culture",
    key: "Bb",
    tempo: 68,
    style: "Contemplativo",
    duration: 360,
    categories: ["Adoración", "Contemporáneo"],
    tags: ["amor", "fidelidad"],
    isFavorite: true,
    createdAt: "2023-05-12T11:15:00Z",
    updatedAt: "2023-05-12T11:15:00Z"
  },
  {
    id: "6",
    title: "Mighty to Save",
    author: "Hillsong",
    key: "G",
    tempo: 75,
    style: "Alabanza",
    duration: 315,
    categories: ["Alabanza", "Contemporáneo"],
    tags: ["salvación", "poder"],
    isFavorite: false,
    createdAt: "2023-06-01T08:00:00Z",
    updatedAt: "2023-06-01T08:00:00Z"
  },
];

// Dummy categories data
const categoriesData: Category[] = [
  { id: "1", name: "Adoración", color: "bg-blue-500" },
  { id: "2", name: "Alabanza", color: "bg-green-500" },
  { id: "3", name: "Clásicos", color: "bg-red-500" },
  { id: "4", name: "Contemporáneo", color: "bg-purple-500" },
  { id: "5", name: "Español", color: "bg-yellow-500" }
];

const Songs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  useEffect(() => {
    // In a real app, we would fetch data from an API here
    setSongs(songsData);
  }, []);
  
  const filteredSongs = songs.filter(song => {
    // Filter by search query (title or author)
    const matchesQuery = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (song.author && song.author.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by selected categories
    const matchesCategories = selectedCategories.length === 0 || 
                             selectedCategories.some(cat => song.categories.includes(cat));
    
    // Filter by favorites
    const matchesFavorites = !showFavorites || song.isFavorite;
    
    return matchesQuery && matchesCategories && matchesFavorites;
  });
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category) 
        : [...prev, category]
    );
  };
  
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setShowFavorites(false);
    setSearchQuery("");
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <Music className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">Canciones</h1>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <RandomSongButton songs={filteredSongs} />
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar canciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowFavorites(prev => !prev)} className="flex justify-between">
                  <span>Favoritos</span>
                  {showFavorites && <Heart className="h-4 w-4 text-destructive fill-destructive" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Categorías</DropdownMenuLabel>
                {categoriesData.map(category => (
                  <DropdownMenuItem 
                    key={category.id} 
                    onClick={() => handleCategoryToggle(category.name)}
                    className="flex justify-between"
                  >
                    <span>{category.name}</span>
                    {selectedCategories.includes(category.name) && <Tag className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResetFilters} className="justify-center text-center">
                  Resetear filtros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button asChild>
              <Link to="/songs/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Active filters */}
        {(selectedCategories.length > 0 || showFavorites || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map(category => (
              <Badge key={category} variant="outline" className="flex items-center gap-1">
                {category}
                <button onClick={() => handleCategoryToggle(category)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {showFavorites && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Heart className="h-3 w-3 fill-current" />
                <span>Favoritos</span>
                <button onClick={() => setShowFavorites(false)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>Búsqueda: {searchQuery}</span>
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Limpiar filtros
            </Button>
          </div>
        )}
        
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No se encontraron canciones</h2>
            <p className="text-muted-foreground">
              Intenta cambiar o eliminar algunos filtros.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleResetFilters}>
              Quitar todos los filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map(song => (
              <Link to={`/songs/${song.id}`} key={song.id}>
                <Card className="h-full hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold">{song.title}</h2>
                        <p className="text-sm text-muted-foreground">{song.author || "Sin autor"}</p>
                      </div>
                      {song.isFavorite && (
                        <Heart className="h-4 w-4 text-destructive fill-destructive" />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {song.key && (
                        <Badge variant="outline">{song.key}</Badge>
                      )}
                      {song.tempo && (
                        <Badge variant="outline">{song.tempo} BPM</Badge>
                      )}
                      {song.duration && (
                        <Badge variant="outline" className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, "0")}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {song.categories.map((cat, idx) => {
                        const category = categoriesData.find(c => c.name === cat);
                        return (
                          <Badge key={idx} variant="secondary" className={category?.color}>
                            {cat}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Songs;
