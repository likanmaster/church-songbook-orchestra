import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Music, Clock, Edit, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Service, Song } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share } from "lucide-react";

// Extended Song type with service-specific properties
interface ServiceSongDetails extends Song {
  order: number;
  serviceNotes?: string;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [songs, setSongs] = useState<ServiceSongDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Datos de ejemplo para canciones disponibles (en una app real, esto vendría de una API)
  const availableSongs: Song[] = [
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
  ];

  // Datos de ejemplo para servicios
  const servicesData: Service[] = [
    {
      id: "1",
      title: "Servicio Dominical",
      date: "2023-12-17",
      theme: "La Gracia de Dios",
      preacher: "Pastor Juan García",
      notes: "Especial de Navidad",
      songs: [
        { id: "s1", songId: "1", order: 1, notes: "Inicio" },
        { id: "s2", songId: "3", order: 2 },
        { id: "s3", songId: "2", order: 3 },
        { id: "s4", songId: "4", order: 4, notes: "Final" },
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
        { id: "s5", songId: "2", order: 1 },
        { id: "s6", songId: "3", order: 2 },
        { id: "s7", songId: "1", order: 3 },
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
        { id: "s8", songId: "4", order: 1 },
        { id: "s9", songId: "1", order: 2 },
      ],
      createdAt: "2023-12-11T16:45:00Z",
      updatedAt: "2023-12-12T08:30:00Z",
    },
  ];

    // Datos de ejemplo para grupos
    const userGroups = [
      { id: "1", name: "Equipo de Alabanza" },
      { id: "2", name: "Grupo de Jóvenes" },
      { id: "3", name: "Coro Principal" },
    ];
  
    const handleShareWithGroup = (groupId: string) => {
      // Aquí iría la lógica para compartir el servicio con el grupo
      toast({
        title: "Servicio compartido",
        description: `El servicio ha sido compartido con el grupo exitosamente.`,
      });
    };

  useEffect(() => {
    // En una app real, aquí haríamos una petición a la API
    // Simulamos una carga de datos asíncrona
    const loadService = async () => {
      setIsLoading(true);
      try {
        // Simulamos un retraso de red
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const foundService = servicesData.find(s => s.id === id);
        if (!foundService) {
          toast({
            title: "Error",
            description: "Servicio no encontrado",
            variant: "destructive",
          });
          navigate("/services");
          return;
        }
        
        setService(foundService);
        
        // Obtener detalles de las canciones asociadas al servicio
        const serviceSongs = foundService.songs.map(serviceSong => {
          const songDetails = availableSongs.find(song => song.id === serviceSong.songId);
          if (!songDetails) return null;
          
          return {
            ...songDetails,
            serviceNotes: serviceSong.notes,
            order: serviceSong.order,
          };
        }).filter(Boolean) as ServiceSongDetails[];
        
        // Ordenar las canciones según el orden definido en el servicio
        serviceSongs.sort((a, b) => a.order - b.order);
        
        setSongs(serviceSongs);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los datos del servicio",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadService();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotalDuration = () => {
    const totalSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando servicio...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2" 
              onClick={() => navigate("/services")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Calendar className="h-8 w-8 mr-3 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{service.title}</h1>
              <p className="text-muted-foreground">{formatDate(service.date)}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Share className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {userGroups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => handleShareWithGroup(group.id)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {group.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={() => navigate(`/services/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Información del Servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.theme && (
                  <div>
                    <span className="font-medium">Tema: </span>
                    <span>{service.theme}</span>
                  </div>
                )}
                
                {service.preacher && (
                  <div>
                    <span className="font-medium">Predicador: </span>
                    <span>{service.preacher}</span>
                  </div>
                )}
                
                {service.notes && (
                  <div>
                    <span className="font-medium">Notas: </span>
                    <p className="mt-1 text-muted-foreground">{service.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Canciones ({songs.length})</h2>
            </div>
            
            <div className="space-y-3">
              {songs.map((song) => (
                <Card key={song.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3">
                          {song.order}
                        </div>
                        <div>
                          <h3 className="font-medium">{song.title}</h3>
                          <p className="text-sm text-muted-foreground">{song.author}</p>
                        </div>
                      </div>
                      
                      <Link to={`/songs/${song.id}`}>
                        <Button variant="ghost" size="sm">
                          <Music className="mr-1 h-4 w-4" />
                          Ver Canción
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-secondary">
                        {song.key}
                      </Badge>
                      {song.duration && (
                        <Badge variant="outline" className="bg-secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")} min
                        </Badge>
                      )}
                      {song.categories.map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{category}</Badge>
                      ))}
                    </div>
                    
                    {song.serviceNotes && (
                      <div className="mt-2 text-sm italic border-l-2 border-primary pl-2">
                        {song.serviceNotes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-4">Resumen del Servicio</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Título</p>
                    <p className="font-medium">{service.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{formatDate(service.date)}</p>
                  </div>
                  
                  {service.theme && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tema</p>
                      <p className="font-medium">{service.theme}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Canciones</p>
                    <p className="font-medium">{songs.length} canciones</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Duración Total</p>
                    <p className="font-medium">{calculateTotalDuration()} minutos</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      asChild
                    >
                      <Link to="/services">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Servicios
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
