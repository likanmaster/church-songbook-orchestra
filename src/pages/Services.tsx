
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, Plus, Edit, Trash2, Eye, Music, User, FolderOpen, Folder } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import ServiceGroupManager from "@/components/services/ServiceGroupManager";
import { Service, ServiceGroup } from "@/types";
import { 
  getAllServices, 
  deleteService, 
  updateService,
  getAllServiceGroups,
  createServiceGroup,
  updateServiceGroup,
  deleteServiceGroup
} from "@/services/service-service";
import { useAuth } from "@/hooks/use-auth-context";

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [servicesData, groupsData] = await Promise.all([
        getAllServices(user?.id || ''),
        getAllServiceGroups(user?.id || '')
      ]);
      setServices(servicesData);
      setServiceGroups(groupsData);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
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

  const handleMoveToGroup = async (serviceId: string, groupId: string | null) => {
    try {
      await updateService(serviceId, { groupId }, user?.id || '');
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, groupId } 
            : service
        )
      );
      
      toast({
        title: "Éxito",
        description: groupId ? "Servicio movido al grupo" : "Servicio desagrupado",
      });
    } catch (error) {
      console.error("Error al mover servicio:", error);
      toast({
        title: "Error",
        description: "No se pudo mover el servicio",
        variant: "destructive",
      });
    }
  };

  const handleCreateGroup = async (groupData: Omit<ServiceGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newGroup = await createServiceGroup(groupData, user?.id || '');
      setServiceGroups(prev => [newGroup, ...prev]);
    } catch (error) {
      console.error("Error al crear grupo:", error);
      throw error;
    }
  };

  const handleUpdateGroup = async (id: string, groupData: Partial<ServiceGroup>) => {
    try {
      await updateServiceGroup(id, groupData, user?.id || '');
      setServiceGroups(prev => 
        prev.map(group => 
          group.id === id 
            ? { ...group, ...groupData, updatedAt: new Date().toISOString() }
            : group
        )
      );
    } catch (error) {
      console.error("Error al actualizar grupo:", error);
      throw error;
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteServiceGroup(id, user?.id || '');
      setServiceGroups(prev => prev.filter(group => group.id !== id));
      // Actualizar servicios para remover el groupId
      setServices(prev => 
        prev.map(service => 
          service.groupId === id 
            ? { ...service, groupId: null }
            : service
        )
      );
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      throw error;
    }
  };

  const getGroupedServices = () => {
    if (selectedGroupId === "all") {
      return services;
    } else if (selectedGroupId === "ungrouped") {
      return services.filter(service => !service.groupId);
    } else {
      return services.filter(service => service.groupId === selectedGroupId);
    }
  };

  const getGroupById = (id: string) => serviceGroups.find(group => group.id === id);

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

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList>
            <TabsTrigger value="services">Mis Servicios</TabsTrigger>
            <TabsTrigger value="groups">Gestionar Grupos</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            {services.length > 0 && (
              <div className="flex items-center gap-4">
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filtrar por grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    <SelectItem value="ungrouped">Sin agrupar</SelectItem>
                    {serviceGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: group.color }}
                          />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
              <div className="space-y-6">
                {selectedGroupId !== "all" && selectedGroupId !== "ungrouped" && (
                  <div className="flex items-center gap-2 mb-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: getGroupById(selectedGroupId)?.color }}
                    />
                    <h2 className="text-xl font-semibold">
                      {getGroupById(selectedGroupId)?.name}
                    </h2>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getGroupedServices().map((service) => (
                    <Card key={service.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Badge className="mb-2" variant="outline">
                              {format(new Date(service.date), "dd MMM yyyy")}
                            </Badge>
                            {service.groupId && selectedGroupId === "all" && (
                              <Badge 
                                variant="secondary" 
                                className="mb-2 text-xs"
                                style={{ 
                                  backgroundColor: getGroupById(service.groupId)?.color + '20',
                                  color: getGroupById(service.groupId)?.color 
                                }}
                              >
                                {getGroupById(service.groupId)?.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Select
                              value={service.groupId || "none"}
                              onValueChange={(value) => 
                                handleMoveToGroup(service.id, value === "none" ? null : value)
                              }
                            >
                              <SelectTrigger className="w-8 h-8 p-0">
                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sin grupo</SelectItem>
                                {serviceGroups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: group.color }}
                                      />
                                      {group.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups">
            <ServiceGroupManager
              groups={serviceGroups}
              onCreateGroup={handleCreateGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ServicesPage;
