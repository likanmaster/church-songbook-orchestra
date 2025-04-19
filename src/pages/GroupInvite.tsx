
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Search, UserPlus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const GroupInvite = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Datos de ejemplo - esto se reemplazará con datos reales de la base de datos
  const users = [
    { id: "4", username: "Ana", email: "ana@example.com" },
    { id: "5", username: "Carlos", email: "carlos@example.com" },
    { id: "6", username: "Elena", email: "elena@example.com" },
  ];

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (userId: string, username: string) => {
    // Aquí iría la lógica para enviar la invitación
    toast({
      title: "Invitación enviada",
      description: `Se ha enviado una invitación a ${username}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/groups/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Invitar Miembros</h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar usuarios por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleInvite(user.id, user.username)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar
                </Button>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No se encontraron usuarios</h3>
              <p className="text-muted-foreground">
                Intenta con un término de búsqueda diferente
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GroupInvite;
