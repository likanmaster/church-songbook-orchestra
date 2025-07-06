
import { useState } from "react";
import { Link } from "react-router-dom";
import { Music, Plus, Search, Filter, Heart, Play, Clock, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import { Separator } from "@/components/ui/separator";

const Songs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data - replace with real data
  const songs = [
    {
      id: 1,
      title: "Amazing Grace",
      artist: "John Newton",
      key: "G",
      style: "Himno",
      duration: "4:30",
      favorite: true
    },
    {
      id: 2,
      title: "How Great Thou Art",
      artist: "Carl Boberg",
      key: "C",
      style: "Adoración",
      duration: "3:45",
      favorite: false
    },
    {
      id: 3,
      title: "Blessed Be Your Name",
      artist: "Matt Redman",
      key: "A",
      style: "Contemporáneo",
      duration: "4:15",
      favorite: true
    }
  ];

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 blur-3xl -z-10"></div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-2">
              Biblioteca Musical
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organiza, busca y gestiona todas tus canciones en un solo lugar
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar canciones, artistas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/30 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-6 mx-2" />
              
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              
              <Button asChild className="group">
                <Link to="/songs/new">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Nueva Canción
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Songs Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <Card key={song.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {song.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {song.artist}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${song.favorite ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 transition-colors`}
                    >
                      <Heart className={`h-4 w-4 ${song.favorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {song.key}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {song.style}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {song.duration}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 group/play">
                      <Play className="mr-2 h-3 w-3 group-hover/play:scale-110 transition-transform" />
                      Reproducir
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/songs/${song.id}`}>
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSongs.map((song) => (
              <Card key={song.id} className="group hover:shadow-md transition-all duration-200 border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg group-hover:scale-105 transition-transform">
                        <Music className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {song.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artist}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {song.key}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {song.style}
                        </Badge>
                      </div>
                      <div className="hidden sm:flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {song.duration}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${song.favorite ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
                      >
                        <Heart className={`h-4 w-4 ${song.favorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/songs/${song.id}`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredSongs.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron canciones</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primera canción"}
              </p>
              <Button asChild>
                <Link to="/songs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Canción
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Songs;
