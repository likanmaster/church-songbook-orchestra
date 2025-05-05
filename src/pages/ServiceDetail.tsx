
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Music, Clock, Edit, ArrowLeft, Users, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Service, Song, ServiceSection } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";
import { getAllSongs } from "@/services/song-service";
import { getServiceById } from "@/services/service-service";

interface ServiceSongDetails extends Song {
  order: number;
  serviceNotes?: string;
}

interface ServiceItem {
  type: 'song' | 'section';
  order: number;
  content: ServiceSongDetails | ServiceSection;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [songs, setSongs] = useState<ServiceSongDetails[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [songsLibrary, setSongsLibrary] = useState<Song[]>([]);

  const userGroups = [
    { id: "1", name: "Equipo de Alabanza" },
    { id: "2", name: "Grupo de Jóvenes" },
    { id: "3", name: "Coro Principal" },
  ];

  const handleShareWithGroup = (groupId: string) => {
    toast({
      title: "Servicio compartido",
      description: `El servicio ha sido compartido con el grupo exitosamente.`,
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${service?.title || 'Servicio Musical'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 20px auto;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .song {
              padding: 15px;
              margin-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .song-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .song-number {
              font-weight: bold;
              margin-right: 10px;
              color: #666;
            }
            .song-title {
              font-weight: bold;
              font-size: 1.1em;
            }
            .song-key {
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${service?.title || 'Servicio Musical'}</h1>
            <p>${formatDate(service?.date || '')}</p>
            ${service?.theme ? `<p>Tema: ${service.theme}</p>` : ''}
            ${service?.preacher ? `<p>Predicador: ${service.preacher}</p>` : ''}
          </div>
          
          <div class="section">
            <h2>Lista de Canciones</h2>
            ${songs.map((song, index) => `
              <div class="song">
                <div class="song-header">
                  <div>
                    <span class="song-number">${index + 1}.</span>
                    <span class="song-title">${song.title}</span>
                  </div>
                  <span class="song-key">Tonalidad: ${song.key || 'C'}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          ${service?.notes ? `
            <div class="section">
              <h2>Notas Adicionales</h2>
              <p>${service.notes}</p>
            </div>
          ` : ''}
          
          ${service?.sections && service.sections.length > 0 ? `
            <div class="section">
              <h2>Secciones del Servicio</h2>
              <ul>
                ${service.sections.map((section, index) => `
                  <li><strong>${section.order}.</strong> ${section.text}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  };

  // Cargar canciones de la biblioteca
  useEffect(() => {
    const loadSongsLibrary = async () => {
      if (!user?.id) return;
      
      try {
        const songs = await getAllSongs(user.id);
        setSongsLibrary(songs);
      } catch (error) {
        console.error("Error al cargar la biblioteca de canciones:", error);
      }
    };
    
    loadSongsLibrary();
  }, [user?.id]);

  useEffect(() => {
    const loadService = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const serviceData = await getServiceById(id);
        console.log("Servicio cargado:", serviceData);
        
        if (!serviceData) {
          toast({
            title: "Error",
            description: "Servicio no encontrado",
            variant: "destructive",
          });
          navigate("/services");
          return;
        }
        
        setService(serviceData);
        
        // Una vez que tenemos el servicio y la biblioteca de canciones, cargamos los detalles de las canciones
        if (serviceData.songs && serviceData.songs.length > 0 && songsLibrary.length > 0) {
          const serviceSongs = serviceData.songs.map(serviceSong => {
            const songDetails = songsLibrary.find(s => s.id === serviceSong.songId);
            
            if (songDetails) {
              return {
                ...songDetails,
                order: serviceSong.order,
                serviceNotes: serviceSong.notes || '',
              };
            }
            return null;
          }).filter(Boolean) as ServiceSongDetails[];
          
          setSongs(serviceSongs);
        }
        
        // Create combined items array with both songs and sections
        let allItems: ServiceItem[] = [];
        
        // Add songs to items array
        if (serviceData.songs) {
          serviceData.songs.forEach(songItem => {
            const songDetails = songsLibrary.find(s => s.id === songItem.songId);
            if (songDetails) {
              const serviceSongDetails: ServiceSongDetails = {
                ...songDetails,
                order: songItem.order,
                serviceNotes: songItem.notes || '',
              };
              
              allItems.push({
                type: 'song',
                order: songItem.order,
                content: serviceSongDetails
              });
            }
          });
        }
        
        // Add sections to items array
        if (serviceData.sections) {
          serviceData.sections.forEach(section => {
            allItems.push({
              type: 'section',
              order: section.order,
              content: section
            });
          });
        }
        
        // Sort all items by order
        allItems.sort((a, b) => a.order - b.order);
        setServiceItems(allItems);
        
      } catch (error) {
        console.error("Error al cargar los datos del servicio:", error);
        toast({
          title: "Error",
          description: "Error al cargar los datos del servicio",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Cargar el servicio cuando tengamos tanto el ID como las canciones
    if (songsLibrary.length > 0) {
      loadService();
    }
  }, [id, navigate, toast, songsLibrary]);

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
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            
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
              <h2 className="text-xl font-bold">Orden del Servicio ({serviceItems.length} elementos)</h2>
            </div>
            
            <div className="space-y-3">
              {serviceItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    {item.type === 'song' && (
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3">
                            {item.order}
                          </div>
                          <div>
                            <h3 className="font-medium">{(item.content as ServiceSongDetails).title}</h3>
                            <p className="text-sm text-muted-foreground">{(item.content as ServiceSongDetails).author || '-'}</p>
                          </div>
                        </div>
                        
                        <Link to={`/songs/${(item.content as ServiceSongDetails).id}`}>
                          <Button variant="ghost" size="sm">
                            <Music className="mr-1 h-4 w-4" />
                            Ver Canción
                          </Button>
                        </Link>
                      </div>
                    )}
                    
                    {item.type === 'song' && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="bg-secondary">
                          {(item.content as ServiceSongDetails).key || 'C'}
                        </Badge>
                        {(item.content as ServiceSongDetails).duration && (
                          <Badge variant="outline" className="bg-secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {Math.floor((item.content as ServiceSongDetails).duration! / 60)}:{String((item.content as ServiceSongDetails).duration! % 60).padStart(2, "0")} min
                          </Badge>
                        )}
                        {(item.content as ServiceSongDetails).categories?.map((category, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{category}</Badge>
                        ))}
                      </div>
                    )}
                    
                    {item.type === 'song' && (item.content as ServiceSongDetails).serviceNotes && (
                      <div className="mt-2 text-sm italic border-l-2 border-primary pl-2">
                        {(item.content as ServiceSongDetails).serviceNotes}
                      </div>
                    )}
                    
                    {item.type === 'section' && (
                      <div className="flex items-center">
                        <div className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3">
                          {item.order}
                        </div>
                        <p className="italic">{(item.content as ServiceSection).text}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {serviceItems.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  Este servicio no contiene canciones ni secciones.
                </div>
              )}
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
                    <p className="text-sm text-muted-foreground">Elementos</p>
                    <p className="font-medium">{serviceItems.length} elementos</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Canciones</p>
                    <p className="font-medium">{songs.length} canciones</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Secciones</p>
                    <p className="font-medium">{service.sections?.length || 0} secciones</p>
                  </div>
                  
                  {songs.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Duración Total</p>
                      <p className="font-medium">{calculateTotalDuration()} minutos</p>
                    </div>
                  )}
                  
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
