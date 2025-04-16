
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Music, FileText, Clock, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  const [recentSongs] = useState([
    { id: "1", title: "Amazing Grace", author: "John Newton", key: "G", isFavorite: true },
    { id: "2", title: "How Great is Our God", author: "Chris Tomlin", key: "C", isFavorite: false },
    { id: "3", title: "10,000 Reasons", author: "Matt Redman", key: "E", isFavorite: true },
  ]);

  const [recentServices] = useState([
    { id: "1", title: "Servicio Dominical", date: "2023-12-17", songCount: 5 },
    { id: "2", title: "Reunión de Jóvenes", date: "2023-12-15", songCount: 8 },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">¡Bienvenido a Church Songbook!</h1>
              <p className="text-muted-foreground">Tu herramienta completa para músicos de iglesia</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/songs/new">
                  <Plus className="mr-2 h-4 w-4" /> Nueva Canción
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/services/new">
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-song-100 to-song-200 dark:from-song-900 dark:to-song-800 border-none shadow-md">
              <CardHeader className="pb-2">
                <Music className="h-12 w-12 text-song-500 mb-2" />
                <CardTitle>Biblioteca de Canciones</CardTitle>
                <CardDescription>Organiza todas tus canciones con detalles completos</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/songs">Ver Canciones</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-gradient-to-br from-song-100 to-song-200 dark:from-song-900 dark:to-song-800 border-none shadow-md">
              <CardHeader className="pb-2">
                <FileText className="h-12 w-12 text-song-500 mb-2" />
                <CardTitle>Generador de Servicios</CardTitle>
                <CardDescription>Crea listas de canciones para tus servicios</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/services">Ver Servicios</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-gradient-to-br from-song-100 to-song-200 dark:from-song-900 dark:to-song-800 border-none shadow-md">
              <CardHeader className="pb-2">
                <Search className="h-12 w-12 text-song-500 mb-2" />
                <CardTitle>Búsqueda Avanzada</CardTitle>
                <CardDescription>Encuentra canciones por tonalidad, tempo, estilo y más</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/search">Buscar Canciones</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Canciones Recientes</h2>
            <Button variant="ghost" asChild>
              <Link to="/songs">Ver Todas</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSongs.map((song) => (
              <Card key={song.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{song.title}</CardTitle>
                  <CardDescription>{song.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm">
                    <span className="px-2 py-1 bg-secondary rounded-md mr-2">
                      Tonalidad: {song.key}
                    </span>
                    {song.isFavorite && (
                      <span className="text-song-500">★ Favorito</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link to={`/songs/${song.id}`}>Ver Detalles</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Servicios Recientes</h2>
            <Button variant="ghost" asChild>
              <Link to="/services">Ver Todos</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>
                    <Clock className="inline h-4 w-4 mr-1" />
                    {new Date(service.date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{service.songCount} canciones</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link to={`/services/${service.id}`}>Ver Detalles</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
