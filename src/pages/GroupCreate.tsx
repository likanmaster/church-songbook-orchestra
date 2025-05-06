
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, UserPlus, Shield, UserMinus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { db, GROUPS_COLLECTION, USERS_COLLECTION } from "@/hooks/use-auth-context";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore"; 
import { useAuth } from "@/hooks/use-auth-context";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const GroupCreate = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState<Array<{
    id: string;
    username: string;
    role: "admin" | "member";
  }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    username: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const usersCollection = collection(db, USERS_COLLECTION);
      // Búsqueda por nombre de usuario
      const q = query(
        usersCollection,
        where("username", ">=", query),
        where("username", "<=", query + "\uf8ff")
      );
      
      const querySnapshot = await getDocs(q);
      const results: Array<{ id: string; username: string }> = [];
      
      querySnapshot.forEach((doc) => {
        // No incluir al usuario actual ni a los usuarios ya seleccionados
        if (doc.id !== user?.id && !selectedUsers.some(selected => selected.id === doc.id)) {
          const userData = doc.data();
          results.push({
            id: doc.id,
            username: (userData.username as string) || "",
          });
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      toast({
        title: "Error",
        description: "No se pudieron buscar usuarios",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = (user: { id: string; username: string }) => {
    setSelectedUsers([...selectedUsers, { ...user, role: "member" }]);
    setSearchResults(searchResults.filter(u => u.id !== user.id));
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const toggleUserRole = (userId: string) => {
    setSelectedUsers(
      selectedUsers.map((user) =>
        user.id === userId
          ? { ...user, role: user.role === "admin" ? "member" : "admin" }
          : user
      )
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un grupo",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedUsers.length === 0) {
      toast({
        description: "Debes agregar al menos un miembro al grupo",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Crear el grupo en Firestore
      const groupData = {
        name: data.name,
        description: data.description || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.id,
        members: [
          // Añadir al creador como administrador
          {
            id: `m${Date.now()}`,
            userId: user.id,
            username: user.username,
            role: 'admin' as 'admin',
            joinedAt: new Date().toISOString(),
          },
          // Añadir los miembros seleccionados
          ...selectedUsers.map(selected => ({
            id: `m${Date.now()}-${selected.id}`,
            userId: selected.id,
            username: selected.username,
            role: selected.role,
            joinedAt: new Date().toISOString(),
          })),
        ],
        sharedSongs: [],
        sharedServices: [],
      };
      
      const docRef = await addDoc(collection(db, GROUPS_COLLECTION), groupData);
      
      toast({
        title: "Grupo creado",
        description: "El grupo se ha creado exitosamente",
      });
      
      navigate(`/groups/${docRef.id}`);
    } catch (error) {
      console.error("Error al crear el grupo:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el grupo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Crear Grupo</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Grupo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Equipo de Alabanza" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe el propósito del grupo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Crear Grupo
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Miembros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="pl-9"
                />
              </div>

              {/* Lista de usuarios encontrados */}
              <div className="space-y-2">
                {isSearching && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                  </div>
                )}
                
                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
                  </div>
                )}
                
                {searchResults.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.username}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddUser(user)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Lista de miembros seleccionados */}
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Miembros seleccionados:</h3>
                {selectedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no has seleccionado ningún miembro</p>
                ) : (
                  selectedUsers.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium block">{user.username}</span>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role === "admin" ? "Administrador" : "Miembro"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleUserRole(user.id)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GroupCreate;
