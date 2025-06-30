import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Music, Edit, Trash2, Star, Copy, Filter, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import SongImporter from "@/components/songs/SongImporter";
import { Song } from "@/types";
import { getAllSongs, deleteSong, toggleSongFavorite, updateSongPublicStatus, copySongToUserAccount } from "@/services/song-service";
import { useAuth } from "@/hooks/use-auth-context";

const SongsPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [copyingSong, setCopyingSong] = useState<string | null>(null);

  // Get unique keys, categories, and styles from songs
  const uniqueKeys = [...new Set(songs.filter(song => song.key).map(song => song.key))].sort();
  const uniqueCategories = [...new Set(songs.flatMap(song => song.categories || []))].sort();
  const uniqueStyles = [...new Set(songs.filter(song => song.style).map(song => song.style))].sort();

  useEffect(() => {
    loadSongs();
  }, [user]);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      const songsData = await getAllSongs(user?.id || '');
      setSongs(songsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load songs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (song: Song, favorite: boolean) => {
    try {
      await toggleSongFavorite(song.id, favorite, user?.id || '');
      setSongs(
        songs.map((s) =>
          s.id === song.id ? { ...s, isFavorite: favorite } : s
        )
      );
      toast({
        title: "Success",
        description: `Song ${favorite ? 'added to' : 'removed from'} favorites`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle favorite",
        variant: "destructive",
      });
    }
  };

  const togglePublic = async (song: Song, isPublic: boolean) => {
    try {
      await updateSongPublicStatus(song.id, isPublic, user?.id || '');
      setSongs(
        songs.map((s) =>
          s.id === song.id ? { ...s, isPublic } : s
        )
      );
      toast({
        title: "Success",
        description: `Song is now ${isPublic ? 'public' : 'private'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update public status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (songId: string) => {
    try {
      await deleteSong(songId, user?.id || '');
      setSongs(songs.filter((s) => s.id !== songId));
      toast({
        title: "Success",
        description: "Song deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete song",
        variant: "destructive",
      });
    }
  };

  const handleCopySong = async (songId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para copiar canciones",
        variant: "destructive"
      });
      return;
    }

    setCopyingSong(songId);
    try {
      const copiedSong = await copySongToUserAccount(songId, user.id);
      setSongs([...songs, copiedSong]);
      toast({
        title: "Canción copiada",
        description: "La canción ha sido copiada a tu biblioteca exitosamente."
      });
    } catch (error) {
      console.error("Error al copiar la canción:", error);
      toast({
        title: "Error",
        description: "No se pudo copiar la canción. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setCopyingSong(null);
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedKey("all");
    setSelectedCategory("all");
    setSelectedStyle("all");
    setShowFavoritesOnly(false);
  };

  const filteredSongs = songs.filter((song) => {
    // First filter by user ownership - keep all songs that belong to user or are accessible
    const isAccessible = song.userId === user?.id || 
                         song.isPublic || 
                         (Array.isArray(song.sharedWith) && song.sharedWith.includes(user?.id || ""));
    
    if (!isAccessible) return false;

    // Search filter
    const matchesSearch = song.title.toLowerCase().includes(search.toLowerCase()) ||
                         (song.author && song.author.toLowerCase().includes(search.toLowerCase()));
    
    // Key filter
    const matchesKey = selectedKey === "all" || song.key === selectedKey;
    
    // Category filter
    const matchesCategory = selectedCategory === "all" || 
                           (song.categories && song.categories.includes(selectedCategory));
    
    // Style filter
    const matchesStyle = selectedStyle === "all" || song.style === selectedStyle;
    
    // Favorites filter
    const matchesFavorites = !showFavoritesOnly || song.isFavorite;
    
    return matchesSearch && matchesKey && matchesCategory && matchesStyle && matchesFavorites;
  });

  // Helper to render star rating
  const renderStarRating = (rating: number = 0) => {
    return (
      <div className="flex items-center mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-3 w-3 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
  };

  const hasActiveFilters = search || selectedKey !== "all" || selectedCategory !== "all" || selectedStyle !== "all" || showFavoritesOnly;

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Canciones</h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <SongImporter />
              </DialogContent>
            </Dialog>
            <Button asChild>
              <Link to="/songs/new">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Canción
              </Link>
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div>
              <Label htmlFor="search">Buscar canción:</Label>
              <Input
                type="text"
                id="search"
                placeholder="Buscar por título o autor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Key Filter */}
              <div>
                <Label>Tonalidad:</Label>
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las tonalidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las tonalidades</SelectItem>
                    {uniqueKeys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <Label>Categoría:</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Style Filter */}
              <div>
                <Label>Estilo musical:</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estilos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estilos</SelectItem>
                    {uniqueStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Favorites Filter */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="favorites-only"
                  checked={showFavoritesOnly}
                  onCheckedChange={setShowFavoritesOnly}
                />
                <Label htmlFor="favorites-only">Solo favoritas</Label>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {search && (
                  <Badge variant="secondary" className="gap-1">
                    Búsqueda: "{search}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
                  </Badge>
                )}
                {selectedKey !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Tonalidad: {selectedKey}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedKey("all")} />
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Categoría: {selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                  </Badge>
                )}
                {selectedStyle !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Estilo: {selectedStyle}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStyle("all")} />
                  </Badge>
                )}
                {showFavoritesOnly && (
                  <Badge variant="secondary" className="gap-1">
                    Solo favoritas
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setShowFavoritesOnly(false)} />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              Lista de Canciones 
              {filteredSongs.length !== songs.length && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({filteredSongs.length} de {songs.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSongs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron canciones con los filtros aplicados" : "No se encontraron canciones"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearAllFilters} className="mt-2">
                    <X className="mr-2 h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSongs.map((song) => (
                  <Card key={song.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{song.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{song.author}</p>
                          {renderStarRating(song.rating || 0)}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleFavorite(song, !song.isFavorite)}
                          >
                            {song.isFavorite ? (
                              <Star className="text-yellow-500 h-4 w-4 fill-yellow-500" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center mb-2">
                        {song.userId === user?.id ? (
                          <div className="flex items-center">
                            <Label htmlFor={`public-${song.id}`} className="mr-2 text-xs">
                              {song.isPublic ? "Pública" : "Privada"}
                            </Label>
                            <Switch 
                              id={`public-${song.id}`}
                              checked={song.isPublic || false}
                              onCheckedChange={(checked) => togglePublic(song, checked)}
                            />
                          </div>
                        ) : (
                          <Badge variant={song.isPublic ? "secondary" : "outline"} className="text-xs">
                            {song.isPublic ? "Pública" : "Compartida"}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {song.key && (
                          <Badge variant="outline" className="text-xs">
                            {song.key}
                          </Badge>
                        )}
                        {song.categories && song.categories.length > 0 && (
                          song.categories.map((category, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/songs/${song.id}`}>
                            <Music className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        
                        {song.userId === user?.id ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/songs/${song.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </Button>
                        ) : (
                          // If the song is public or shared and not owned by the user, show the copy button
                          (song.isPublic || (Array.isArray(song.sharedWith) && song.sharedWith.includes(user?.id || ""))) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCopySong(song.id)}
                              disabled={copyingSong === song.id}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {copyingSong === song.id ? 'Copiando...' : 'Copiar'}
                            </Button>
                          )
                        )}
                      </div>
                      
                      {song.userId === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(song.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SongsPage;
