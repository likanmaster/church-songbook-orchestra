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
import { getAllSongs, getAllCategories, toggleSongFavorite } from "@/services/song-service";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth-context";

const Songs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        const [fetchedSongs, fetchedCategories] = await Promise.all([
          getAllSongs(),
          getAllCategories()
        ]);
        
        setSongs(fetchedSongs);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error al cargar canciones:", error);
        toast.error("Error al cargar las canciones");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchSongs();
    }
  }, [isAuthenticated]);
  
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
  
  const handleToggleFavorite = async (songId: string, isFavorite: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await toggleSongFavorite(songId, !isFavorite);
      
      // Actualizar el estado local
      setSongs(currentSongs => 
        currentSongs.map(song => 
          song.id === songId 
            ? { ...song, isFavorite: !isFavorite } 
            : song
        )
      );
      
      toast.success(isFavorite 
        ? "Canción eliminada de favoritos" 
        : "Canción añadida a favoritos"
      );
    } catch (error) {
      console.error("Error al cambiar favorito:", error);
      toast.error("Error al actualizar favorito");
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando canciones...</p>
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
                {categories.map(category => (
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
              {songs.length > 0 
                ? "Intenta cambiar o eliminar algunos filtros."
                : "No hay canciones agregadas todavía."
              }
            </p>
            <div className="flex gap-2 justify-center mt-4">
              {songs.length > 0 && (
                <Button variant="outline" onClick={handleResetFilters}>
                  Quitar todos los filtros
                </Button>
              )}
              <Button asChild>
                <Link to="/songs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir canción
                </Link>
              </Button>
            </div>
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
                      <button 
                        onClick={(e) => handleToggleFavorite(song.id, song.isFavorite, e)}
                        className="focus:outline-none"
                      >
                        <Heart 
                          className={`h-4 w-4 ${song.isFavorite ? 'text-destructive fill-destructive' : 'text-gray-400 hover:text-destructive'}`} 
                        />
                      </button>
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
                        const category = categories.find(c => c.name === cat);
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
