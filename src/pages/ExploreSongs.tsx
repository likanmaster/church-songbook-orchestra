
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Music, Search, Star, User, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { db, SONGS_COLLECTION, USERS_COLLECTION } from "@/hooks/use-auth-context";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Song } from "@/types";
import { copySongToUserAccount } from "@/services/song-service";
import { useAuth } from "@/hooks/use-auth-context";

const ExploreSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copyingSong, setCopyingSong] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPublicSongs = async () => {
      setIsLoading(true);
      try {
        const songsQuery = query(
          collection(db, SONGS_COLLECTION),
          where("isPublic", "==", true)
        );

        const querySnapshot = await getDocs(songsQuery);
        const publicSongs: Song[] = [];

        for (const songDoc of querySnapshot.docs) {
          const songData = songDoc.data();
          
          // Obtener información del usuario que creó la canción
          let userName = "Usuario desconocido";
          try {
            const userDoc = await getDoc(doc(db, USERS_COLLECTION, songData.userId));
            if (userDoc.exists()) {
              userName = userDoc.data().username || userDoc.data().displayName || "Usuario";
            }
          } catch (error) {
            console.log("Error al obtener usuario:", error);
          }

          publicSongs.push({
            id: songDoc.id,
            title: songData.title || "",
            author: songData.author || "",
            key: songData.key || "",
            lyrics: songData.lyrics || "",
            tempo: songData.tempo || null,
            tags: songData.tags || [],
            categories: songData.categories || [],
            createdAt: songData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            updatedAt: songData.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
            userId: songData.userId || "",
            isFavorite: songData.isFavorite || false,
            style: songData.style || null,
            duration: songData.duration || null,
            notes: songData.notes || null,
            isPublic: songData.isPublic || false,
            sharedWith: songData.sharedWith || [],
            createdBy: userName
          });
        }

        // Ordenar por fecha de creación (más recientes primero)
        publicSongs.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setSongs(publicSongs);
      } catch (error) {
        console.error("Error al cargar canciones públicas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicSongs();
  }, []);

  const handleCopySong = async (songId: string) => {
    console.log("Iniciando copia de canción:", songId, "Usuario:", user?.id);
    
    if (!user?.id) {
      console.log("Usuario no autenticado");
      toast({
        title: "Error",
        description: "Debes iniciar sesión para copiar canciones",
        variant: "destructive"
      });
      return;
    }

    setCopyingSong(songId);
    console.log("Estado de copiado establecido para:", songId);
    
    try {
      console.log("Llamando a copySongToUserAccount...");
      const copiedSong = await copySongToUserAccount(songId, user.id);
      console.log("Canción copiada exitosamente:", copiedSong);
      
      toast({
        title: "Canción copiada",
        description: "La canción ha sido copiada a tu biblioteca exitosamente."
      });
    } catch (error) {
      console.error("Error al copiar la canción:", error);
      
      let errorMessage = "No se pudo copiar la canción. Intente nuevamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      console.log("Finalizando copia, limpiando estado");
      setCopyingSong(null);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Canciones Públicas</h1>
            <p className="text-muted-foreground">Descubre canciones compartidas por la comunidad</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar canciones por título, autor o etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, index) => (
              <Card key={`skeleton-${index}`}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 rounded-md mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <Card key={song.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span>{song.title}</span>
                    {song.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0 ml-2" />
                    )}
                  </CardTitle>
                  <CardDescription>{song.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-1 bg-secondary rounded-md text-sm">
                      Tonalidad: {song.key}
                    </span>
                    {song.style && (
                      <span className="px-2 py-1 bg-secondary rounded-md text-sm">
                        {song.style}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    <span>Por {song.createdBy}</span>
                  </div>
                  {song.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {song.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {song.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                          +{song.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/songs/${song.id}`}>Ver Canción</Link>
                  </Button>
                  {user && song.userId !== user.id && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleCopySong(song.id)}
                      disabled={copyingSong === song.id}
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {copyingSong === song.id ? 'Copiando...' : 'Copiar'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center p-12">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {searchTerm ? "No se encontraron canciones" : "No hay canciones públicas disponibles"}
              </p>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Intenta con otros términos de búsqueda" 
                  : "Sé el primero en compartir una canción con la comunidad"
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExploreSongs;
