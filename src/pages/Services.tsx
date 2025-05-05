
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, Plus, Edit, Trash2, Eye, Music, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className="mb-2" variant="outline">{format(new Date(service.date), "dd MMM yyyy")}</Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
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
                  <CardTitle>{service.title}</CardTitle>
                  {service.theme && <CardDescription>{service.theme}</CardDescription>}
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    {service.preacher && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{service.preacher}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.songs?.length || 0} canciones</span>
                    </div>
                    {service.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 italic">
                        "{service.notes}"
                      </p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <div className="flex justify-between w-full gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={`/services/${service.id}/edit`}>
                        <Edit className="mr-1 h-4 w-4" /> Editar
                      </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild className="flex-1">
                      <Link to={`/services/${service.id}`}>
                        <Eye className="mr-1 h-4 w-4" /> Ver
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ServicesPage;
