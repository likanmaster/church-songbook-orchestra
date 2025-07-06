
import { useState } from "react";
import { Search as SearchIcon, Music, BookOpen, Users, Filter, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Mock data - replace with real data
  const searchResults = {
    songs: [
      {
        id: 1,
        title: "Amazing Grace",
        artist: "John Newton",
        type: "song",
        category: "Himno",
        plays: 1200
      },
      {
        id: 2,
        title: "How Great Thou Art",
        artist: "Carl Boberg",
        type: "song",
        category: "Adoración",
        plays: 950
      }
    ],
    services: [
      {
        id: 1,
        title: "Servicio Dominical Especial",
        description: "Servicio con tema de gratitud",
        type: "service",
        songsCount: 8,
        likes: 45
      }
    ],
    groups: [
      {
        id: 1,
        name: "Ministerio de Alabanza Central",
        description: "Grupo activo con repertorio variado",
        type: "group",
        membersCount: 15,
        songsCount: 120
      }
    ]
  };

  const trendingTopics = [
    "Adoración contemporánea",
    "Himnos clásicos",
    "Música navideña",
    "Alabanza juvenil",
    "Adoración instrumental"
  ];

  const popularCategories = [
    { name: "Adoración", count: 150, icon: Music, color: "from-blue-500 to-blue-600" },
    { name: "Himnos", count: 89, icon: BookOpen, color: "from-green-500 to-green-600" },
    { name: "Contemporáneo", count: 120, icon: Sparkles, color: "from-purple-500 to-purple-600" },
    { name: "Navideño", count: 45, icon: TrendingUp, color: "from-red-500 to-red-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-purple-600/20 to-blue-600/20 blur-3xl -z-10"></div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Explorar Contenido
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre nueva música, servicios y grupos de la comunidad
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar canciones, servicios, grupos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg bg-white/70 border-white/30 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avanzados
              </Button>
            </div>
          </div>
        </div>

        {searchTerm ? (
          // Search Results
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-md">
              <TabsTrigger value="all">Todo</TabsTrigger>
              <TabsTrigger value="songs">Canciones</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="groups">Grupos</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* All Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...searchResults.songs, ...searchResults.services, ...searchResults.groups].map((item: any) => (
                  <Card key={`${item.type}-${item.id}`} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.type === 'song' ? 'Canción' : item.type === 'service' ? 'Servicio' : 'Grupo'}
                        </Badge>
                        {item.plays && (
                          <div className="text-xs text-muted-foreground">
                            {item.plays} reproducciones
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {item.title || item.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {item.artist || item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="songs" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.songs.map((song) => (
                  <Card key={song.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {song.title}
                      </CardTitle>
                      <CardDescription>{song.artist}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{song.category}</Badge>
                        <div className="text-sm text-muted-foreground">
                          {song.plays} reproducciones
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.services.map((service) => (
                  <Card key={service.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {service.songsCount} canciones
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {service.likes} me gusta
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.groups.map((group) => (
                  <Card key={group.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {group.name}
                      </CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div>{group.membersCount} miembros</div>
                        <div>{group.songsCount} canciones</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Discovery Content
          <div className="space-y-8">
            {/* Trending Topics */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                Tendencias Populares
              </h2>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="rounded-full hover:bg-orange-50 hover:border-orange-200 transition-colors"
                    onClick={() => setSearchTerm(topic)}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {topic}
                  </Button>
                ))}
              </div>
            </section>

            {/* Popular Categories */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Categorías Populares</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularCategories.map((category, index) => (
                  <Card
                    key={index}
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden"
                    onClick={() => setSearchTerm(category.name)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.count} elementos
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Empty Search Results */}
        {searchTerm && [...searchResults.songs, ...searchResults.services, ...searchResults.groups].length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
              <p className="text-muted-foreground mb-4">
                Intenta con otros términos de búsqueda o explora las categorías populares
              </p>
              <Button onClick={() => setSearchTerm("")}>
                Explorar Categorías
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
