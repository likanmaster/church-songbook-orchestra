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
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8 py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl -z-10 animate-float"></div>
            <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-fade-in">
              Music Team
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            La herramienta completa para organizar, planificar y compartir música en tu iglesia con elegancia y simplicidad
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex flex-wrap gap-4 justify-center">
                {quickActions.map((action, index) => (
                  <Link key={action.path} to={action.path}>
                    <Button 
                      className="group btn-glow interactive-lift rounded-2xl px-8 py-4 text-lg font-medium" 
                      size="lg"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <action.icon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      {action.title}
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button size="lg" className="group btn-glow interactive-lift bg-gradient-primary hover:bg-gradient-primary rounded-2xl px-8 py-4 text-lg font-medium">
                  <Sparkles className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Comenzar Gratis
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="interactive-lift rounded-2xl px-8 py-4 text-lg font-medium border-2">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Features Grid */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient">Funcionalidades Principales</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Todo lo que necesitas para gestionar la música de tu iglesia</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.id}
                className={`card-modern group cursor-pointer overflow-hidden relative ${
                  hoveredCard === feature.id ? 'scale-105 shadow-2xl' : ''
                }`}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-1 ${feature.color} absolute top-0 left-0 right-0`}></div>
                <CardHeader className="pb-6 pt-8">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-2xl ${feature.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full font-medium">
                        {feature.stats}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                  <Link to={feature.path}>
                    <Button variant="ghost" className="group/btn w-full justify-between interactive-lift rounded-xl h-12 text-base font-medium">
                      Explorar
                      <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        {user && (
          <section className="glass rounded-3xl p-10 border border-white/20">
            <div className="text-center mb-10 space-y-4">
              <h3 className="text-3xl md:text-4xl font-bold text-gradient">Tu Actividad</h3>
              <p className="text-muted-foreground text-lg">Resumen de tu contenido musical</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="card-modern p-8 space-y-4 interactive-scale">
                  <Music className="h-12 w-12 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-primary">{stats.songs}</div>
                  <div className="text-lg font-medium text-muted-foreground">Canciones</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="card-modern p-8 space-y-4 interactive-scale">
                  <BookOpen className="h-12 w-12 text-accent mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-accent">{stats.services}</div>
                  <div className="text-lg font-medium text-muted-foreground">Servicios</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="card-modern p-8 space-y-4 interactive-scale">
                  <Users className="h-12 w-12 text-secondary mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-secondary">{stats.groups}</div>
                  <div className="text-lg font-medium text-muted-foreground">Grupos</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!user && (
          <section className="text-center bg-gradient-primary text-white rounded-3xl p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-secondary opacity-20 animate-float"></div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para comenzar?</h3>
              <p className="text-primary-light text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
                Únete a miles de iglesias que ya organizan su música de forma profesional
              </p>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="group btn-glow interactive-lift rounded-2xl px-10 py-6 text-lg font-medium">
                  <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Crear Cuenta Gratuita
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
