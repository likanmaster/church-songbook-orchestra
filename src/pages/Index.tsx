import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Music, FileText, Clock, Search, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth-context";
import { db, SONGS_COLLECTION, SERVICES_COLLECTION } from "@/hooks/use-auth-context";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Service, Song } from "@/types";

const Index = () => {
  const { user } = useAuth();
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  useEffect(() => {
    const fetchRecentSongs = async () => {
      if (!user?.id) return;
      
      setIsLoadingSongs(true);
      try {
        const songsQuery = query(
          collection(db, SONGS_COLLECTION),
          where("userId", "==", user.id),
          orderBy("updatedAt", "desc"),
          limit(3)
        );

        const querySnapshot = await getDocs(songsQuery);
        const songs: Song[] = [];
        
        querySnapshot.forEach((doc) => {
          const songData = doc.data();
          songs.push({
            id: doc.id,
            title: songData.title || "",
            author: songData.author || "",
            key: songData.key || "",
            lyrics: songData.lyrics || "",
            // Remove the timeSignature property as it's not in the Song type
            tempo: songData.tempo || null,
            capo: songData.capo || null,
            tags: songData.tags || [],
            categories: songData.categories || [],
            createdAt: songData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            updatedAt: songData.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
            userId: songData.userId || "",
            isFavorite: songData.isFavorite || false
          });
        });
        
        setRecentSongs(songs);
      } catch (error) {
        console.error("Error al cargar canciones recientes:", error);
      } finally {
        setIsLoadingSongs(false);
      }
    };

    const fetchRecentServices = async () => {
      if (!user?.id) return;
      
      setIsLoadingServices(true);
      try {
        const servicesQuery = query(
          collection(db, SERVICES_COLLECTION),
          where("userId", "==", user.id),
          orderBy("updatedAt", "desc"),
          limit(3)
        );

        const querySnapshot = await getDocs(servicesQuery);
        const services: Service[] = [];
        
        querySnapshot.forEach((doc) => {
          const serviceData = doc.data();
          services.push({
            id: doc.id,
            title: serviceData.title || "",
            date: serviceData.date || new Date().toISOString().split('T')[0],
            theme: serviceData.theme || null,
            preacher: serviceData.preacher || null,
            notes: serviceData.notes || null,
            songs: serviceData.songs || [],
            createdAt: serviceData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            updatedAt: serviceData.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
            userId: serviceData.userId || "",
            sections: serviceData.sections || [],
            isPublic: serviceData.isPublic || false,
            sharedWith: serviceData.sharedWith || []
          });
        });
        
        setRecentServices(services);
      } catch (error) {
        console.error("Error al cargar servicios recientes:", error);
      } finally {
        setIsLoadingServices(false);
      }
    };

    if (user?.id) {
      fetchRecentSongs();
      fetchRecentServices();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">¡Bienvenido a Church Songbook!</h1>
              <p className="text-muted-foreground">Tu herramienta completa para músicos de iglesia</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/songs/new">
                  <Plus className="mr-2 h-4 w-4" /> Nueva Canción
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/services/new">
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 border-none shadow-md">
              <CardHeader className="pb-2">
                <Music className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Biblioteca de Canciones</CardTitle>
                <CardDescription>Organiza todas tus canciones con detalles completos</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/songs">Ver Canciones</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 border-none shadow-md">
              <CardHeader className="pb-2">
                <FileText className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Generador de Servicios</CardTitle>
                <CardDescription>Crea listas de canciones para tus servicios</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/services">Ver Servicios</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 border-none shadow-md">
              <CardHeader className="pb-2">
                <Search className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Búsqueda Avanzada</CardTitle>
                <CardDescription>Encuentra canciones por tonalidad, tempo, estilo y más</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/search">Buscar Canciones</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Canciones Recientes</h2>
            <Button variant="ghost" asChild>
              <Link to="/songs">Ver Todas</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingSongs ? (
              // Skeleton loaders mientras se cargan las canciones
              Array(3).fill(0).map((_, index) => (
                <Card key={`song-skeleton-${index}`}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-full" />
                  </CardFooter>
                </Card>
              ))
            ) : recentSongs.length > 0 ? (
              recentSongs.map((song) => (
                <Card key={song.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{song.title}</CardTitle>
                    <CardDescription>{song.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm">
                      <span className="px-2 py-1 bg-secondary rounded-md mr-2">
                        Tonalidad: {song.key}
                      </span>
                      {song.isFavorite && (
                        <span className="text-yellow-500">
                          <Star className="h-4 w-4 inline fill-yellow-500 stroke-yellow-500" /> Favorito
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/songs/${song.id}`}>Ver Detalles</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center p-6">
                <p className="text-muted-foreground mb-4">No has creado ninguna canción todavía</p>
                <Button asChild>
                  <Link to="/songs/new">
                    <Plus className="mr-2 h-4 w-4" /> Crear Primera Canción
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Servicios Recientes</h2>
            <Button variant="ghost" asChild>
              <Link to="/services">Ver Todos</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingServices ? (
              // Skeleton loaders mientras se cargan los servicios
              Array(3).fill(0).map((_, index) => (
                <Card key={`service-skeleton-${index}`}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-full" />
                  </CardFooter>
                </Card>
              ))
            ) : recentServices.length > 0 ? (
              recentServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>
                      <Clock className="inline h-4 w-4 mr-1" />
                      {new Date(service.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{service.songs.length} canciones</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/services/${service.id}`}>Ver Detalles</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center p-6">
                <p className="text-muted-foreground mb-4">No has creado ningún servicio todavía</p>
                <Button asChild>
                  <Link to="/services/new">
                    <Plus className="mr-2 h-4 w-4" /> Crear Primer Servicio
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
