
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Song } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

interface RandomSongButtonProps {
  songs: Song[];
}

export const RandomSongButton = ({ songs }: RandomSongButtonProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRandomSong = () => {
    if (songs.length === 0) {
      toast({
        title: "No hay canciones",
        description: "No se encontraron canciones para seleccionar",
        variant: "destructive",
      });
      return;
    }

    setIsAnimating(true);
    
    // Add a small delay for animation effect
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * songs.length);
      const randomSong = songs[randomIndex];
      
      toast({
        title: "Canción seleccionada",
        description: `${randomSong.title} - ${randomSong.author || "Sin autor"}`,
        variant: "default",
      });
      
      navigate(`/songs/${randomSong.id}`);
      setIsAnimating(false);
    }, 500);
  };

  const buttonContent = (
    <Button
      variant="outline"
      size="icon"
      onClick={handleRandomSong}
      className={`${isAnimating ? "animate-spin" : ""}`}
      aria-label="Seleccionar canción aleatoria"
    >
      <Shuffle className="h-4 w-4" />
    </Button>
  );

  if (isMobile) {
    return buttonContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>Canción aleatoria</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
