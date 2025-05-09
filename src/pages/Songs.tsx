
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Music, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Song } from "@/types";
import { getAllSongs, deleteSong, toggleSongFavorite, updateSongPublicStatus } from "@/services/song-service";
import { useAuth } from "@/hooks/use-auth-context";

const SongsPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

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

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(search.toLowerCase())
  );

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
          <Button asChild>
            <Link to="/songs/new">
              <Plus className="mr-2 h-4 w-4" />
              Añadir Canción
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Canciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="search">Buscar canción:</Label>
              <Input
                type="text"
                id="search"
                placeholder="Buscar por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Separator />
            
            {filteredSongs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No se encontraron canciones</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
                          <Link to={`/songs/${song.id}/edit`}>
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SongsPage;
