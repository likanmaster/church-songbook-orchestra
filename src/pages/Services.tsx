
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Search, Music, Clock } from "lucide-react";
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

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Datos de ejemplo
  const [services] = useState<Service[]>([
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
  ]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Servicios Musicales</h1>
          <Button asChild className="mt-4 sm:mt-0">
            <Link to="/services/new">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
            </Link>
          </Button>
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
      </main>
    </div>
  );
};

export default Services;
