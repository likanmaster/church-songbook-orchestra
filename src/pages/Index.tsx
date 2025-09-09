import { useState } from "react";
import { Link } from "react-router-dom";
import { Music, BookOpen, Users, Search, Plus, Sparkles, ArrowRight, Play, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth-context";
import { useQuery } from "@tanstack/react-query";
import { getAllSongs } from "@/services/song-service";
import { getAllServices } from "@/services/service-service";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, GROUPS_COLLECTION } from "@/hooks/use-auth-context";

const Index = () => {
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Obtener canciones del usuario
  const { data: songs = [] } = useQuery({
    queryKey: ['user-songs', user?.id],
    queryFn: () => getAllSongs(user?.id || ''),
    enabled: !!user?.id,
  });

  // Obtener servicios del usuario
  const { data: services = [] } = useQuery({
    queryKey: ['user-services', user?.id],
    queryFn: () => getAllServices(user?.id || ''),
    enabled: !!user?.id,
  });

  // Obtener grupos del usuario
  const { data: userGroups = [] } = useQuery({
    queryKey: ['user-groups', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const allGroupsQuery = collection(db, GROUPS_COLLECTION);
      const querySnapshot = await getDocs(allGroupsQuery);
      
      const groups: any[] = [];
      querySnapshot.forEach((doc) => {
        const groupData = doc.data();
        const isMember = groupData.members.some(
          (member: any) => member.userId === user.id
        );
        
        if (isMember) {
          groups.push({ id: doc.id, ...groupData });
        }
      });
      
      return groups;
    },
    enabled: !!user?.id,
  });

  // Calcular estadísticas reales
  const userSongs = songs.filter(song => song.userId === user?.id);
  const userServices = services.filter(service => service.userId === user?.id);

  const stats = {
    songs: userSongs.length,
    services: userServices.length,
    groups: userGroups.length,
  };

  const features = [
    {
      id: "songs",
      title: "Gestión de Canciones",
      description: "Organiza y administra tu repertorio musical con facilidad",
      icon: Music,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-blue-100 text-blue-600",
      path: "/songs",
      stats: "500+ canciones"
    },
    {
      id: "services",
      title: "Planificación de Servicios",
      description: "Crea y organiza servicios con plantillas personalizables",
      icon: BookOpen,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      iconBg: "bg-green-100 text-green-600",
      path: "/services",
      stats: "Plantillas automáticas"
    },
    {
      id: "groups",
      title: "Colaboración en Grupos",
      description: "Trabaja en equipo y comparte contenido musical",
      icon: Users,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBg: "bg-purple-100 text-purple-600",
      path: "/groups",
      stats: "Tiempo real"
    },
    {
      id: "explore",
      title: "Explorar Contenido",
      description: "Descubre nueva música y servicios de la comunidad",
      icon: Search,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconBg: "bg-orange-100 text-orange-600",
      path: "/search",
      stats: "Descubre más"
    }
  ];

  const quickActions = [
    { title: "Nueva Canción", icon: Music, path: "/songs/new", color: "text-blue-600" },
    { title: "Nuevo Servicio", icon: Plus, path: "/services/new", color: "text-green-600" },
    { title: "Explorar", icon: Search, path: "/search", color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 blur-3xl -z-10"></div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Music Team
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            La herramienta completa para organizar, planificar y compartir música en tu iglesia con elegancia y simplicidad
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex gap-3">
                {quickActions.map((action) => (
                  <Link key={action.path} to={action.path}>
                    <Button className="group relative overflow-hidden" size="lg">
                      <action.icon className={`mr-2 h-4 w-4 ${action.color} group-hover:scale-110 transition-transform`} />
                      {action.title}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="group">
                  <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades Principales</h2>
            <p className="text-muted-foreground text-lg">Todo lo que necesitas para gestionar la música de tu iglesia</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card 
                key={feature.id}
                className={`group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  hoveredCard === feature.id ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`h-2 ${feature.color} rounded-t-lg`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${feature.iconBg} group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {feature.stats}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    {feature.description}
                  </CardDescription>
                  <Link to={feature.path}>
                    <Button variant="ghost" className="group/btn w-full justify-between">
                      Explorar
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        {user && (
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Tu Actividad</h3>
              <p className="text-muted-foreground">Resumen de tu contenido musical</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Music className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{stats.songs}</div>
                  <div className="text-sm text-muted-foreground">Canciones</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{stats.services}</div>
                  <div className="text-sm text-muted-foreground">Servicios</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{stats.groups}</div>
                  <div className="text-sm text-muted-foreground">Grupos</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!user && (
          <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
            <h3 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Únete a miles de iglesias que ya organizan su música de forma profesional
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="group">
                <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                Crear Cuenta Gratuita
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
