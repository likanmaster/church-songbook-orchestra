
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Search, Music, Clock, Sparkles } from "lucide-react";
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

type SongOption = { id: string; title: string; key: string };

const SONG_LIBRARY: SongOption[] = [
  { id: "1", title: "Cuan Grande es Él", key: "Sol" },
  { id: "2", title: "Sublime Gracia", key: "La" },
  { id: "3", title: "Te Doy Gloria", key: "Re" },
  { id: "4", title: "Dios de Pactos", key: "Mi" },
  { id: "5", title: "Eres Mi Respirar", key: "Do" },
  { id: "6", title: "Ven, Ahora es el Tiempo", key: "Fa" },
  { id: "7", title: "Eres Fiel", key: "Si♭" },
  { id: "8", title: "Me Has Mirado a los Ojos", key: "Mi" },
  { id: "9", title: "Me Rindo a Ti", key: "Re" },
];

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

function generateRandomService(): Service {
  // Generar id único simple
  const id = String(Math.random()).slice(2);
  // Fecha random +/- 7 días
  const now = new Date();
  const offset = Math.floor(Math.random() * 14) - 7;
  now.setDate(now.getDate() + offset);
  // Seleccionar tema, título y predicador
  const title = getRandomItem(TITLES);
  const theme = getRandomItem(THEMES);
  const preacher = Math.random() > 0.3 ? getRandomItem(PREACHERS) : undefined;
  // Seleccionar canciones únicas y aleatorias
  const songCount = 2 + Math.floor(Math.random()*3);
  const songs = shuffle(SONG_LIBRARY)
    .slice(0, songCount)
    .map((song, idx) => ({
      id: "s" + (1000*Math.random()).toFixed(0),
      order: idx + 1,
      songId: song.id,
      title: song.title,
      key: song.key,
    }));
  // Notas random
  const notes = Math.random() > 0.6 ? "Servicio especial de alabanza" : undefined;

  return {
    id,
    title,
    date: now.toISOString().slice(0, 10),
    theme,
    preacher,
    notes,
    songs: songs,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      title: "Servicio Dominical",
      date: "2023-12-17",
      theme: "La Gracia de Dios",
      preacher: "Pastor Juan García",
      notes: "Especial de Navidad",
      songs: [
        { id: "s1", songId: "1", order: 1, title: "Cuan Grande es Él", key: "Sol" },
        { id: "s2", songId: "3", order: 2, title: "Te Doy Gloria", key: "Re" },
        { id: "s3", songId: "2", order: 3, title: "Sublime Gracia", key: "La" },
        { id: "s4", songId: "4", order: 4, title: "Dios de Pactos", key: "Mi" },
      ],
      createdAt: "2023-12-10T14:30:00Z",
      updatedAt: "2023-12-14T09:15:00Z",
    },
    {
      id: "2",
      title: "Reunión de Jóvenes",
      date: "2023-12-15",
      theme: "Fe en Acción",
      preacher: "Líder de Jóvenes",
      songs: [
        { id: "s5", songId: "2", order: 1, title: "Sublime Gracia", key: "La" },
        { id: "s6", songId: "3", order: 2, title: "Te Doy Gloria", key: "Re" },
        { id: "s7", songId: "1", order: 3, title: "Cuan Grande es Él", key: "Sol" },
      ],
      createdAt: "2023-12-08T10:20:00Z",
      updatedAt: "2023-12-08T10:20:00Z",
    },
    {
      id: "3",
      title: "Culto de Oración",
      date: "2023-12-13",
      theme: "Intercesión",
      songs: [
        { id: "s8", songId: "4", order: 1, title: "Dios de Pactos", key: "Mi" },
        { id: "s9", songId: "1", order: 2, title: "Cuan Grande es Él", key: "Sol" },
      ],
      createdAt: "2023-12-11T16:45:00Z",
      updatedAt: "2023-12-12T08:30:00Z",
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceCandidate, setServiceCandidate] = useState<Service | null>(null);

  // Filtrar servicios basados en búsqueda
  const filteredServices = services.filter((service) => {
    return service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (service.theme?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
           (service.preacher?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
  });

  // Ordenar servicios por fecha (más reciente primero)
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

  const handleGenerate = () => {
    const generated = generateRandomService();
    setServiceCandidate(generated);
    setModalOpen(true);
  };

  const handleSaveGenerated = () => {
    if (serviceCandidate) {
      setServices((prev) => [
        { ...serviceCandidate },
        ...prev
      ]);
      setServiceCandidate(null);
      setModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setServiceCandidate(null);
    setModalOpen(false);
  };

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
            <p className="text-muted-foreground mb-6">Intenta con otra búsqueda o crea un nuevo servicio musical.</p>
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
        />
      </main>
    </div>
  );
};

export default Services;
