
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Search, Music, Clock, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import { Service } from "@/types";
import ServicePreviewModal from "@/components/services/ServicePreviewModal";
import { getAllServices, createService } from "@/services/service-service";
import { getAllSongs } from "@/services/song-service";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth-context";

type SongOption = { id: string; title: string; key: string };

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [songs, setSongs] = useState<SongOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceCandidate, setServiceCandidate] = useState<Service | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedServices, fetchedSongs] = await Promise.all([
          getAllServices(),
          getAllSongs()
        ]);
        
        setServices(fetchedServices);
        
        // Convertimos las canciones al formato necesario para las opciones
        const songOptions: SongOption[] = fetchedSongs.map(song => ({
          id: song.id,
          title: song.title,
          key: song.key || ""
        }));
        
        setSongs(songOptions);
      } catch (error) {
        console.error("Error al cargar servicios:", error);
        toast.error("Error al cargar los servicios");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const filteredServices = services.filter((service) => {
    return service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (service.theme?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
           (service.preacher?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const generateRandomService = (): Service => {
    const PREACHERS = [
      "Pastor Juan García", "Líder de Jóvenes", "Hermana María", "Invitado Especial", "Hermano Pedro"
    ];

    const THEMES = [
      "La Gracia de Dios", "Fe en Acción", "Intercesión", "Esperanza Viva", "Amor Inagotable"
    ];

    const TITLES = [
      "Servicio Dominical",
      "Reunión de Oración",
      "Culto de Jóvenes",
      "Servicio de Celebración",
      "Culto Familiar"
    ];

    function getRandomItem<T>(arr: T[]): T {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function shuffle<T>(arr: T[]): T[] {
      return [...arr].sort(() => 0.5 - Math.random());
    }

    const now = new Date();
    const offset = Math.floor(Math.random() * 14) - 7;
    now.setDate(now.getDate() + offset);
    
    const title = getRandomItem(TITLES);
    const theme = getRandomItem(THEMES);
    const preacher = Math.random() > 0.3 ? getRandomItem(PREACHERS) : undefined;
    const songCount = Math.min(songs.length, 2 + Math.floor(Math.random()*3));
    const serviceSongs = shuffle(songs)
      .slice(0, songCount)
      .map((song, idx) => ({
        id: "s" + Math.floor(Math.random() * 10000),
        songId: song.id,
        order: idx + 1,
      }));
    const notes = Math.random() > 0.6 ? "Servicio especial de alabanza" : undefined;

    return {
      id: String(Math.random()).slice(2),
      title,
      date: now.toISOString().slice(0, 10),
      theme,
      preacher,
      notes,
      songs: serviceSongs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleGenerate = () => {
    if (songs.length === 0) {
      toast.error("No hay canciones disponibles para generar un servicio");
      return;
    }
    
    const generated = generateRandomService();
    setServiceCandidate(generated);
    setModalOpen(true);
  };

  const handleSaveGenerated = async () => {
    if (serviceCandidate) {
      setIsLoading(true);
      
      try {
        // Guardar en Firebase
        const { id, createdAt, updatedAt, ...serviceData } = serviceCandidate;
        const newService = await createService(serviceData);
        
        // Actualizar el estado local
        setServices((prev) => [newService, ...prev]);
        
        toast.success("Servicio generado y guardado exitosamente");
      } catch (error) {
        console.error("Error al guardar el servicio:", error);
        toast.error("Error al guardar el servicio generado");
      } finally {
        setIsLoading(false);
        setServiceCandidate(null);
        setModalOpen(false);
      }
    }
  };

  const handleCloseModal = () => {
    setServiceCandidate(null);
    setModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando servicios...</p>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <h1 className="text-3xl font-bold">Servicios Musicales</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/services/new">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
              </Link>
            </Button>
            <Button onClick={handleGenerate} variant="secondary">
              <Sparkles className="mr-2 h-4 w-4" /> Generar Servicio Aleatorio
            </Button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar servicios por título, tema o predicador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedServices.map((service) => (
            <Card key={service.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{service.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(service.date)}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-secondary">
                    <Music className="h-3 w-3 mr-1" /> 
                    {service.songs.length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                {service.theme && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Tema: </span>
                    <span>{service.theme}</span>
                  </div>
                )}
                
                {service.preacher && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Predicador: </span>
                    <span>{service.preacher}</span>
                  </div>
                )}
                
                {service.notes && (
                  <div className="text-sm text-muted-foreground mt-2 italic">
                    "{service.notes}"
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button asChild variant="default" className="w-full">
                  <Link to={`/services/${service.id}`}>
                    <Clock className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No se encontraron servicios</h3>
            <p className="text-muted-foreground mb-6">
              {services.length > 0 
                ? "Intenta con otra búsqueda o crea un nuevo servicio musical."
                : "No hay servicios guardados todavía. Crea tu primer servicio musical."
              }
            </p>
            <Button asChild>
              <Link to="/services/new">
                <Plus className="mr-2 h-4 w-4" /> Crear Servicio
              </Link>
            </Button>
          </div>
        )}

        <ServicePreviewModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveGenerated}
          service={serviceCandidate}
          songLibrary={songs}
        />
      </main>
    </div>
  );
};

export default Services;
