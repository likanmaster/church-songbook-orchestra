
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Music } from "lucide-react";
import { Song } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface RandomSongByStyleModalProps {
  songs: Song[];
  userMusicStyles: string[];
  onSongSelect: (song: Song) => void;
}

const RandomSongByStyleModal = ({ songs, userMusicStyles, onSongSelect }: RandomSongByStyleModalProps) => {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const getRandomSongByStyle = () => {
    if (!selectedStyle) {
      toast({
        title: "Error",
        description: "Selecciona un estilo musical primero",
        variant: "destructive",
      });
      return;
    }

    const songsOfStyle = songs.filter(song => song.style === selectedStyle);
    
    if (songsOfStyle.length === 0) {
      toast({
        title: "Sin canciones",
        description: `No tienes canciones del estilo "${selectedStyle}"`,
        variant: "destructive",
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * songsOfStyle.length);
    const randomSong = songsOfStyle[randomIndex];
    
    onSongSelect(randomSong);
    setIsOpen(false);
    setSelectedStyle("");
    
    toast({
      title: "Canción agregada",
      description: `"${randomSong.title}" ha sido agregada al servicio`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Shuffle className="mr-2 h-4 w-4" />
          Canción Aleatoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Canción Aleatoria por Estilo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Selecciona un estilo musical:</label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Elige un estilo musical" />
              </SelectTrigger>
              <SelectContent>
                {userMusicStyles.map((style) => {
                  const songsCount = songs.filter(song => song.style === style).length;
                  return (
                    <SelectItem key={style} value={style}>
                      <div className="flex items-center justify-between w-full">
                        <span>{style}</span>
                        <Badge variant="secondary" className="ml-2">
                          {songsCount} {songsCount === 1 ? 'canción' : 'canciones'}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={getRandomSongByStyle} disabled={!selectedStyle}>
              <Shuffle className="mr-2 h-4 w-4" />
              Obtener Canción
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RandomSongByStyleModal;
