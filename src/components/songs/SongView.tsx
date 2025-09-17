
import { Music, Heart, Clock, User, Brush, Music2, FileText, StickyNote, Tag, Eye, EyeOff, Trash, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Song, Group } from "@/types";
import { useState, useEffect } from "react";
import KeyTransposer from "./KeyTransposer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import ChordLyrics from "./ChordLyrics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSong, copySongToUserAccount } from "@/services/song-service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth-context";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import { db, GROUPS_COLLECTION, USERS_COLLECTION } from "@/hooks/use-auth-context";

interface SongViewProps {
  song: Song;
}

const SongView = ({ song }: SongViewProps) => {
  const [currentKey, setCurrentKey] = useState<string>(song.key || "");
  const { toast } = useToast();
  const [showChords, setShowChords] = useState<boolean>(true);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  
  // Check if the song can be copied (it's public or shared with the user)
  const canCopySong = song.isPublic || (Array.isArray(song.sharedWith) && song.sharedWith.includes(user?.id || ""));
  // Check if the user is the owner of the song
  const isOwnSong = song.userId === user?.id;

  // Cargar los grupos del usuario
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user?.id) return;
      
      setIsLoadingGroups(true);
      try {
        // Obtener todos los grupos para luego filtrarlos
        const groupsCollection = collection(db, GROUPS_COLLECTION);
        const querySnapshot = await getDocs(groupsCollection);
        
        const groups: Group[] = [];
        
        querySnapshot.forEach((doc) => {
          const groupData = doc.data();
          
          // Verificar si el usuario es miembro (filtrando por userId)
          const isMember = Array.isArray(groupData.members) && 
                          groupData.members.some((member: any) => member.userId === user.id);
          
          if (isMember) {
            groups.push({
              id: doc.id,
              ...groupData,
              createdAt: groupData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
              updatedAt: groupData.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
            } as Group);
          }
        });
        
        setUserGroups(groups);
      } catch (error) {
        console.error("Error al obtener grupos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los grupos",
        });
      } finally {
        setIsLoadingGroups(false);
      }
    };
    
    fetchUserGroups();
  }, [user?.id, toast]);

  const handleShareWithGroup = async (groupId: string, groupName: string) => {
    if (!user?.id || !song.id) return;
    
    try {
      // 1. Actualizar el array sharedSongs del grupo
      const groupRef = doc(db, GROUPS_COLLECTION, groupId);
      await updateDoc(groupRef, {
        sharedSongs: arrayUnion(song.id),
        updatedAt: serverTimestamp()
      });
      
      // 2. Enviar notificación a todos los miembros del grupo (excepto al usuario actual)
      // Obtener los miembros del grupo
      const groupDoc = await getDocs(query(collection(db, GROUPS_COLLECTION), where("id", "==", groupId)));
      let members: {userId: string, username: string}[] = [];
      
      groupDoc.forEach((doc) => {
        const groupData = doc.data();
        members = groupData.members || [];
      });
      
      // Enviar notificación a cada miembro excepto al usuario actual
      for (const member of members) {
        if (member.userId !== user.id) {
          // Crear una notificación en la colección de notificaciones del usuario
          const notificationId = `song_${song.id}_${Date.now()}`;
          await setDoc(doc(db, USERS_COLLECTION, member.userId, 'notifications', notificationId), {
            type: 'new_song',
            groupId: groupId,
            groupName: groupName,
            from: user.username,
            fromId: user.id,
            contentId: song.id,
            contentName: song.title,
            createdAt: serverTimestamp(),
            read: false
          });
        }
      }
      
      toast({
        title: "Canción compartida",
        description: `La canción ha sido compartida con el grupo "${groupName}" exitosamente.`,
      });
    } catch (error) {
      console.error("Error al compartir la canción:", error);
      toast({
        title: "Error",
        description: "No se pudo compartir la canción con el grupo.",
        variant: "destructive",
      });
    }
  };
  
  const handleCopySong = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para copiar canciones",
        variant: "destructive"
      });
      return;
    }

    setIsCopying(true);
    try {
      const copiedSong = await copySongToUserAccount(song.id, user.id);
      toast({
        title: "Canción copiada",
        description: "La canción ha sido copiada a tu biblioteca exitosamente."
      });
      navigate(`/songs/${copiedSong.id}`);
    } catch (error) {
      console.error("Error al copiar la canción:", error);
      toast({
        title: "Error",
        description: "No se pudo copiar la canción. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsCopying(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteSong(song.id, user?.id || '');
      toast({
        title: "Canción eliminada",
        description: "La canción ha sido eliminada exitosamente."
      });
      navigate("/songs");
    } catch (error) {
      console.error("Error al eliminar la canción:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la canción. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Transponemos las letras con acordes si es necesario
  const transposeLyrics = (lyrics: string): string => {
    if (!song.key || !currentKey || currentKey === song.key || !lyrics) {
      return lyrics;
    }

    const chordPattern = /\[(.*?)\]/g;
    const chords = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    
    const transposeChord = (chord: string, semitones: number) => {
      // Separamos la nota base del modificador (m, 7, maj7, etc)
      const match = chord.match(/^([A-G][#b]?)(.*)$/);
      if (!match) return chord;
      
      const baseChord = match[1];
      const modifier = match[2] || '';
      
      // Encontramos la posición en el array de acordes
      let index = -1;
      
      // Manejar acordes con bemoles
      if (baseChord.includes('b')) {
        const flatToSharp: Record<string, string> = {
          "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"
        };
        const sharpEquivalent = flatToSharp[baseChord];
        if (sharpEquivalent) {
          index = chords.indexOf(sharpEquivalent);
        }
      } else {
        index = chords.indexOf(baseChord);
      }
      
      if (index === -1) return chord;
      
      // Calculamos la nueva posición con transposición
      let newIndex = (index + semitones) % 12;
      if (newIndex < 0) newIndex += 12;
      
      return chords[newIndex] + modifier;
    };
    
    // Calcular cuántos semitonos transponer
    const fromIndex = chords.indexOf(song.key);
    const toIndex = chords.indexOf(currentKey);
    
    if (fromIndex === -1 || toIndex === -1) {
      return lyrics;
    }
    
    let semitones = toIndex - fromIndex;
    // Ajustar si estamos dando la vuelta al círculo de quintas
    if (semitones > 6) semitones -= 12;
    if (semitones < -6) semitones += 12;
    
    // Reemplazamos cada acorde en la letra
    return lyrics.replace(chordPattern, (match, chord) => {
      const transposedChord = transposeChord(chord, semitones);
      return `[${transposedChord}]`;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5"></div>
        <div className="relative backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                    <Music className="h-10 w-10 text-primary-foreground" />
                  </div>
                  {song.isFavorite && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-destructive fill-destructive" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-2 tracking-tight">
                    {song.title}
                  </h1>
                  {song.author && (
                    <p className="text-lg text-muted-foreground flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {song.author}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {song.style && (
                      <Badge variant="secondary" className="px-3 py-1">
                        <Brush className="h-3 w-3 mr-1" />
                        {song.style}
                      </Badge>
                    )}
                    {song.key && (
                      <Badge variant="outline" className="px-3 py-1">
                        <Music2 className="h-3 w-3 mr-1" />
                        {currentKey || song.key}
                      </Badge>
                    )}
                    {song.tempo && (
                      <Badge variant="outline" className="px-3 py-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {song.tempo} BPM
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {isOwnSong && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esta acción eliminará permanentemente la canción "{song.title}" y sus datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete} 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {!isOwnSong && canCopySong && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopySong}
                    disabled={isCopying}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {isCopying ? 'Copiando...' : 'Copiar'}
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="gap-2">
                      <Share className="h-4 w-4" />
                      Compartir
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {isLoadingGroups ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm">Cargando grupos...</span>
                      </div>
                    ) : userGroups.length > 0 ? (
                      userGroups.map((group) => (
                        <DropdownMenuItem
                          key={group.id}
                          onClick={() => handleShareWithGroup(group.id, group.name)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          {group.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No perteneces a ningún grupo
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Lyrics Section */}
          <div className="xl:col-span-3">
            {song.lyrics && (
              <Card className="overflow-hidden border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      Letra de la canción
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Acordes</span>
                        <Switch 
                          checked={showChords}
                          onCheckedChange={setShowChords}
                        />
                        {showChords ? (
                          <Eye className="h-4 w-4 text-primary" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  {song.key && (
                    <div className="pt-4">
                      <KeyTransposer 
                        songKey={song.key} 
                        onKeyChange={setCurrentKey}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-8">
                  <div className="relative">
                    <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                      <ChordLyrics 
                        lyrics={transposeLyrics(song.lyrics)}
                        showChords={showChords}
                        transposedKey={currentKey}
                        originalKey={song.key}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Musical Information */}
            {(song.tempo || song.duration) && (
              <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Music2 className="h-4 w-4 text-primary" />
                    </div>
                    Detalles Musicales
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {song.tempo && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Music2 className="h-4 w-4" />
                          Tempo
                        </div>
                        <span className="font-semibold text-foreground">{song.tempo} BPM</span>
                      </div>
                    )}
                    
                    {song.duration && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Duración
                        </div>
                        <span className="font-semibold text-foreground">
                          {Math.floor(Number(song.duration) / 60)}:
                          {String(Number(song.duration) % 60).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories and Tags */}
            {(song.categories?.length > 0 || song.tags?.length > 0) && (
              <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-primary" />
                    </div>
                    Clasificación
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {song.categories && song.categories.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                      <div className="flex flex-wrap gap-2">
                        {song.categories.map((category, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="px-3 py-1 text-sm rounded-full hover:bg-secondary/80 transition-colors"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {song.tags && song.tags.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Etiquetas</p>
                      <div className="flex flex-wrap gap-2">
                        {song.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Additional Notes */}
            {song.notes && (
              <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <StickyNote className="h-4 w-4 text-primary" />
                    </div>
                    Notas Adicionales
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {song.notes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongView;
