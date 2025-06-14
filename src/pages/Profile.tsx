
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Music, Heart, Upload, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAuth, updateProfile } from "firebase/auth";
import Navbar from "@/components/layout/Navbar";
import { getAllSongs } from "@/services/song-service";
import { getAllServices } from "@/services/service-service";
import { Song, Service } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, USERS_COLLECTION } from "@/hooks/use-auth-context";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Obtener canciones del usuario
  const { data: songs = [], isLoading: songsLoading } = useQuery({
    queryKey: ['songs', user?.id],
    queryFn: () => getAllSongs(user?.id || ''),
    enabled: !!user?.id,
  });

  // Obtener servicios del usuario
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services', user?.id],
    queryFn: () => getAllServices(user?.id || ''),
    enabled: !!user?.id,
  });

  // Calcular estadísticas reales
  const userSongs = songs.filter(song => song.userId === user?.id);
  const favoriteSongs = songs.filter(song => song.isFavorite && song.userId === user?.id);
  const userServices = services.filter(service => service.userId === user?.id);

  const stats = {
    songs: userSongs.length,
    favorites: favoriteSongs.length,
    services: userServices.length,
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      if (user.photoURL) {
        setAvatarUrl(user.photoURL);
      }
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mt-8">Loading...</div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Actualizar Firebase Auth
        await updateProfile(currentUser, {
          displayName: username,
          photoURL: avatarUrl || undefined
        });

        // Actualizar documento de usuario en Firestore
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        await updateDoc(userDocRef, {
          username: username,
          photoURL: avatarUrl || null,
          updatedAt: serverTimestamp()
        });

        toast.success("Perfil actualizado correctamente");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar perfil");
    }
  };

  const getUserInitials = () => {
    if (username) {
      return username.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-8 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} className="object-cover" />
                ) : (
                  <AvatarFallback className="text-lg font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Upload className="h-6 w-6 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <div>
              <CardTitle>{username || "Usuario"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Gestiona tu información personal
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {(songsLoading || servicesLoading) ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Cargando estadísticas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <Music className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">{stats.songs}</h3>
                  <p className="text-sm text-muted-foreground">Canciones</p>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <Heart className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">{stats.favorites}</h3>
                  <p className="text-sm text-muted-foreground">Favoritos</p>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <BookOpen className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">{stats.services}</h3>
                  <p className="text-sm text-muted-foreground">Servicios</p>
                </Card>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={true}
                />
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    El email no se puede cambiar directamente por razones de seguridad.
                  </p>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProfile}>Guardar</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Editar</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
