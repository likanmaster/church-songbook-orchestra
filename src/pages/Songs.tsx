import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Music, Edit, Trash2, Star, Copy, Filter, X, Upload, Download, List, Grid } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Navbar from "@/components/layout/Navbar";
import SongImporter from "@/components/songs/SongImporter";
import SongExporter from "@/components/songs/SongExporter";
import { Song } from "@/types";
import { getAllSongs, deleteSong, toggleSongFavorite, updateSongPublicStatus, copySongToUserAccount, updateSong } from "@/services/song-service";
import { getUserMusicStyles } from "@/services/user-service";
import CustomStyleSelect from "@/components/songs/CustomStyleSelect";
import { useAuth } from "@/hooks/use-auth-context";

const SongsPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [userMusicStyles, setUserMusicStyles] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [copyingSong, setCopyingSong] = useState<string | null>(null);

  // Filtrar solo canciones del usuario actual
  const userOwnedSongs = songs.filter(song => song.userId === user?.id);

  // Get unique keys, categories, and styles from user's songs only
  const uniqueKeys = [...new Set(userOwnedSongs.filter(song => song.key).map(song => song.key))].sort();
  const uniqueCategories = [...new Set(userOwnedSongs.flatMap(song => song.categories || []))].sort();
  const songsStyles = [...new Set(userOwnedSongs.filter(song => song.style).map(song => song.style))];
  
  // Combinar estilos de canciones con estilos del usuario, eliminando duplicados
  const allAvailableStyles = [...new Set([...userMusicStyles, ...songsStyles])].sort();

  useEffect(() => {
    if (user) {
      loadSongs();
      loadUserMusicStyles();
    }
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

  const loadUserMusicStyles = async () => {
    if (!user?.id) return;
    
    try {
      const styles = await getUserMusicStyles(user.id);
      setUserMusicStyles(styles);
    } catch (error) {
      console.error("Error loading user music styles:", error);
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

  const handleStyleChange = async (songId: string, style: string | null) => {
    if (!user?.id) return;
    
    try {
      const updatedSong = await updateSong(songId, { style }, user.id);
      setSongs(songs.map(s => s.id === songId ? updatedSong : s));
      toast({
        title: "Estilo actualizado",
        description: "El estilo musical ha sido guardado exitosamente."
      });
    } catch (error) {
      console.error("Error al actualizar estilo:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estilo musical.",
        variant: "destructive"
      });
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedKey("all");
    setSelectedCategory("all");
    setSelectedStyle("all");
    setShowFavoritesOnly(false);
  };

  // Filtrar solo las canciones del usuario
  const filteredSongs = userOwnedSongs.filter((song) => {
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Mis Canciones</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Importar</span>
                  <span className="sm:hidden">Import</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg mx-4">
                <SongImporter />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl mx-4">
                <SongExporter songs={userOwnedSongs} />
              </DialogContent>
            </Dialog>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/songs/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Añadir Canción</span>
                <span className="sm:hidden">Nueva</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                    {allAvailableStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Favorites Filter */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="favorites-only"
                    checked={showFavoritesOnly}
                    onCheckedChange={setShowFavoritesOnly}
                  />
                  <Label htmlFor="favorites-only" className="text-sm">Solo favoritas</Label>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                <Label className="text-sm">Vista:</Label>
                <ToggleGroup 
                  type="single" 
                  value={viewMode} 
                  onValueChange={(value) => value && setViewMode(value as "cards" | "list")}
                  className="justify-start mt-1"
                >
                  <ToggleGroupItem value="cards" aria-label="Vista de tarjetas" className="px-2">
                    <Grid className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="Vista de lista" className="px-2">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Clear Filters Button */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-1 flex items-end">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full"
                    size="sm"
                  >
                    <X className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Limpiar filtros</span>
                    <span className="sm:hidden">Limpiar</span>
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
            <CardTitle className="flex items-center gap-2">
              Lista de Canciones
              <Badge variant="secondary" className="ml-2">
                {userOwnedSongs.length} {userOwnedSongs.length === 1 ? 'canción' : 'canciones'}
              </Badge>
              {filteredSongs.length !== userOwnedSongs.length && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({filteredSongs.length} mostradas)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSongs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No se encontraron canciones con los filtros aplicados" : "No tienes canciones aún"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearAllFilters} className="mt-2">
                    <X className="mr-2 h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : viewMode === "cards" ? (
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
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {song.key && (
                          <Badge variant="outline" className="text-xs">
                            {song.key}
                          </Badge>
                        )}
                        {song.style ? (
                          <Badge variant="default" className="text-xs">
                            {song.style}
                          </Badge>
                        ) : allAvailableStyles.length > 0 ? (
                          <div className="w-32">
                            <Select onValueChange={(style) => handleStyleChange(song.id, style)}>
                              <SelectTrigger className="h-6 text-xs">
                                <SelectValue placeholder="Asignar estilo" />
                              </SelectTrigger>
                              <SelectContent>
                                {allAvailableStyles.map((style) => (
                                  <SelectItem key={style} value={style} className="text-xs">
                                    {style}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Sin estilo
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
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/songs/${song.id}?edit=true`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(song.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSongs.map((song) => (
                  <div key={song.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-1">
                        <h3 className="font-semibold">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.author}</p>
                      </div>
                      
                      {song.key && (
                        <Badge variant="outline" className="text-xs">
                          {song.key}
                        </Badge>
                      )}
                      
                       {song.style ? (
                         <Badge variant="default" className="text-xs">
                           {song.style}
                         </Badge>
                       ) : allAvailableStyles.length > 0 ? (
                         <div className="w-32">
                           <Select onValueChange={(style) => handleStyleChange(song.id, style)}>
                             <SelectTrigger className="h-6 text-xs">
                               <SelectValue placeholder="Asignar estilo" />
                             </SelectTrigger>
                             <SelectContent>
                               {allAvailableStyles.map((style) => (
                                 <SelectItem key={style} value={style} className="text-xs">
                                   {style}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                       ) : (
                         <Badge variant="outline" className="text-xs text-muted-foreground">
                           Sin estilo
                         </Badge>
                       )}
                      
                      {song.categories && song.categories.length > 0 && (
                        <div className="flex gap-1">
                          {song.categories.slice(0, 2).map((category, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {song.categories.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{song.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
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
                        
                        <Switch 
                          checked={song.isPublic || false}
                          onCheckedChange={(checked) => togglePublic(song, checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/songs/${song.id}`}>
                          <Music className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/songs/${song.id}?edit=true`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(song.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
