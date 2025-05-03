
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Music, Heart, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAuth, updateProfile } from "firebase/auth";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Mock stats - in a real app these would come from your backend
  const stats = {
    songs: 12,
    favorites: 5,
    services: 3,
  };

  if (isLoading || !user) {
    return <div className="container mt-8">Loading...</div>;
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
        await updateProfile(currentUser, {
          displayName: username
        });
        toast.success("Perfil actualizado correctamente");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar perfil");
    }
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} className="object-cover" />
              ) : (
                <AvatarFallback>
                  <User className="h-10 w-10" />
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
            <CardTitle>Perfil</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gestiona tu información personal
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Music className="h-8 w-8 mb-2 text-primary" />
              <h3 className="text-2xl font-bold">{stats.services}</h3>
              <p className="text-sm text-muted-foreground">Servicios</p>
            </Card>
          </div>

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
                disabled={true} // Email cannot be changed in Firebase without reauthentication
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
  );
};

export default Profile;
