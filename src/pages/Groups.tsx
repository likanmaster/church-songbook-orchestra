
import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Search, Settings, UserPlus, Music, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/layout/Navbar";
import { Separator } from "@/components/ui/separator";

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with real data
  const groups = [
    {
      id: 1,
      name: "Ministerio de Alabanza",
      description: "Grupo principal de música y adoración",
      membersCount: 12,
      role: "Admin",
      lastActivity: "Hace 2 horas",
      songsCount: 45,
      servicesCount: 8
    },
    {
      id: 2,
      name: "Jóvenes en Acción",
      description: "Ministerio juvenil - música contemporánea",
      membersCount: 8,
      role: "Miembro",
      lastActivity: "Hace 1 día",
      songsCount: 23,
      servicesCount: 3
    },
    {
      id: 3,
      name: "Coro de Niños",
      description: "Grupo musical para el ministerio infantil",
      membersCount: 15,
      role: "Moderador",
      lastActivity: "Hace 3 días",
      songsCount: 18,
      servicesCount: 5
    }
  ];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800";
      case "Moderador": return "bg-blue-100 text-blue-800";
      case "Miembro": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 blur-3xl -z-10"></div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
              Grupos Musicales
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Colabora con tu equipo musical y organiza servicios en conjunto
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar grupos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 border-white/30 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              
              <Button asChild className="group">
                <Link to="/groups/new">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Crear Grupo
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`text-xs ${getRoleColor(group.role)}`}>
                    {group.role}
                  </Badge>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {group.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {group.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {group.membersCount} miembros
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {group.lastActivity}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      {group.songsCount} canciones
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {group.servicesCount} servicios
                    </div>
                  </div>

                  {/* Members Preview */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-white">
                          <AvatarFallback className="text-xs">
                            {String.fromCharCode(65 + i)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {group.membersCount > 3 && (
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{group.membersCount - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link to={`/groups/${group.id}`}>
                      Abrir Grupo
                    </Link>
                  </Button>
                  {group.role === "Admin" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/groups/${group.id}/invite`}>
                        <UserPlus className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron grupos</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza creando tu primer grupo musical"}
              </p>
              <Button asChild>
                <Link to="/groups/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Grupo
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Groups;
