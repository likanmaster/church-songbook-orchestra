
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, Calendar, User, Music } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import { db, SERVICES_COLLECTION, USERS_COLLECTION } from "@/hooks/use-auth-context";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Service } from "@/types";

const ExploreServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPublicServices = async () => {
      setIsLoading(true);
      try {
        const servicesQuery = query(
          collection(db, SERVICES_COLLECTION),
          where("isPublic", "==", true)
        );

        const querySnapshot = await getDocs(servicesQuery);
        const publicServices: Service[] = [];

        for (const serviceDoc of querySnapshot.docs) {
          const serviceData = serviceDoc.data();
          
          // Obtener información del usuario que creó el servicio
          let userName = "Usuario desconocido";
          try {
            const userDoc = await getDoc(doc(db, USERS_COLLECTION, serviceData.userId));
            if (userDoc.exists()) {
              userName = userDoc.data().username || userDoc.data().displayName || "Usuario";
            }
          } catch (error) {
            console.log("Error al obtener usuario:", error);
          }

          publicServices.push({
            id: serviceDoc.id,
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
            sharedWith: serviceData.sharedWith || [],
            createdBy: userName
          });
        }

        // Ordenar por fecha de creación (más recientes primero)
        publicServices.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setServices(publicServices);
      } catch (error) {
        console.error("Error al cargar servicios públicos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicServices();
  }, []);

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.theme && service.theme.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.preacher && service.preacher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Servicios Públicos</h1>
            <p className="text-muted-foreground">Explora servicios compartidos por otros usuarios</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar servicios por título, tema o predicador..."
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
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    {new Date(service.date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {service.theme && (
                    <p className="text-sm mb-2">
                      <strong>Tema:</strong> {service.theme}
                    </p>
                  )}
                  {service.preacher && (
                    <p className="text-sm mb-2">
                      <strong>Predicador:</strong> {service.preacher}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Music className="h-3 w-3 mr-1" />
                    <span>{service.songs.length} canciones</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    <span>Por {service.createdBy}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/services/${service.id}`}>Ver Servicio</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center p-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {searchTerm ? "No se encontraron servicios" : "No hay servicios públicos disponibles"}
              </p>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Intenta con otros términos de búsqueda" 
                  : "Sé el primero en compartir un servicio con la comunidad"
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExploreServices;
