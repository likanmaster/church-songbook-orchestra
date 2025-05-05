
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, Plus, Edit, Trash2, Eye, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/layout/Navbar";
import { Service } from "@/types";
import { getAllServices, deleteService } from "@/services/service-service";
import { useAuth } from "@/hooks/use-auth-context";

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadServices();
  }, [user]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const servicesData = await getAllServices(user?.id || '');
      setServices(servicesData);
    } catch (error) {
      console.error("Error al cargar los servicios:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await deleteService(serviceToDelete, user?.id || '');
      
      setServices((prev) => prev.filter((service) => service.id !== serviceToDelete));
      
      toast({
        title: "Éxito",
        description: "Servicio eliminado correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
    } finally {
      setServiceToDelete(null);
    }
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

  // Example service for demonstration purposes
  const exampleService: Service = {
    id: "example-id",
    title: "Servicio Dominical",
    date: new Date().toISOString(),
    theme: "Esperanza en Cristo",
    preacher: "Pastor Juan",
    notes: "Preparar himnos de adoración",
    songs: [
      { id: "song-1", songId: "1", order: 1 },
      { id: "song-2", songId: "2", order: 2 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: user?.id || ''
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Servicios</h1>
          <Button asChild>
            <Link to="/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Servicio
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No hay servicios</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Aún no has creado ningún servicio. Comienza creando tu primer servicio.
                </p>
                <Button asChild>
                  <Link to="/services/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Servicio
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Tema</TableHead>
                    <TableHead className="hidden lg:table-cell">Predicador</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {format(new Date(service.date), "dd/MM/yyyy")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{service.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{service.theme || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{service.preacher || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/services/${service.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/services/${service.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setServiceToDelete(service.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará el servicio
                                  permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setServiceToDelete(null)}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ServicesPage;
