import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Music, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Song } from "@/types";
import { getAllSongs, deleteSong, toggleSongFavorite } from "@/services/song-service";
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
            
            <ScrollArea className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Título</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSongs.map((song) => (
                    <TableRow key={song.id}>
                      <TableCell className="font-medium">{song.title}</TableCell>
                      <TableCell>{song.author}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/songs/${song.id}`}>
                            <Music className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/songs/${song.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(song, !song.isFavorite)}
                        >
                          {song.isFavorite ? (
                            <Star className="text-yellow-500 h-4 w-4" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(song.id)}
                        >
                          <Trash2 className="text-red-500 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSongs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No se encontraron canciones.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SongsPage;
