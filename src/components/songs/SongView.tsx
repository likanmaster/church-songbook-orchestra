
import { Music, Heart, Clock, User, Brush, Music2, FileText, Sticky, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Song } from "@/types";

interface SongViewProps {
  song: Song;
}

const SongView = ({ song }: SongViewProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-gradient-to-r from-song-100 to-song-200 dark:from-song-800 dark:to-song-700 p-6 rounded-xl shadow-md">
        <div className="flex items-center">
          <div className="bg-primary/10 p-3 rounded-full mr-5">
            <Music className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{song.title}</h1>
            {song.author && <p className="text-muted-foreground flex items-center gap-1">
              <User className="h-4 w-4" /> {song.author}
            </p>}
          </div>
        </div>
        {song.isFavorite && <div className="bg-song-100 dark:bg-song-800 p-2 rounded-full">
          <Heart className="h-6 w-6 text-song-500 fill-song-500" />
        </div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-song-200 dark:border-song-800 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-song-50/50 dark:bg-song-900/30 border-b border-song-100 dark:border-song-800">
            <CardTitle className="text-lg flex items-center gap-2">
              <Music2 className="h-5 w-5 text-primary" />
              Información Musical
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {song.style && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estilo</p>
                  <p className="font-medium flex items-center gap-2">
                    <Brush className="h-4 w-4 text-song-500" />
                    {song.style}
                  </p>
                </div>
              )}
              
              {song.key && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tonalidad</p>
                  <p className="font-medium flex items-center gap-2">
                    <Music2 className="h-4 w-4 text-song-500" />
                    {song.key}
                  </p>
                </div>
              )}
              
              {song.tempo && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tempo</p>
                  <p className="font-medium flex items-center gap-2">
                    <Music2 className="h-4 w-4 text-song-500" />
                    {song.tempo} bpm
                  </p>
                </div>
              )}
              
              {song.duration && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Duración</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-song-500" />
                    {Math.floor(Number(song.duration) / 60)}:
                    {String(Number(song.duration) % 60).padStart(2, "0")} minutos
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {(song.categories?.length > 0 || song.tags?.length > 0) && (
          <Card className="border-song-200 dark:border-song-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-song-50/50 dark:bg-song-900/30 border-b border-song-100 dark:border-song-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Clasificación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {song.categories && song.categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Categorías</p>
                  <div className="flex flex-wrap gap-2">
                    {song.categories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 bg-song-100 dark:bg-song-800 hover:bg-song-200 dark:hover:bg-song-700 transition-colors">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {song.tags && song.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Etiquetas</p>
                  <div className="flex flex-wrap gap-2">
                    {song.tags.map((tag, index) => (
                      <Badge key={index} className="px-3 py-1 bg-primary/80 hover:bg-primary transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {song.lyrics && (
        <Card className="border-song-200 dark:border-song-800 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-song-50/50 dark:bg-song-900/30 border-b border-song-100 dark:border-song-800">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Letra
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap font-sans bg-background p-4 rounded-md border border-song-100 dark:border-song-800">
              {song.lyrics}
            </pre>
          </CardContent>
        </Card>
      )}

      {song.notes && (
        <Card className="border-song-200 dark:border-song-800 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-song-50/50 dark:bg-song-900/30 border-b border-song-100 dark:border-song-800">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sticky className="h-5 w-5 text-primary" />
              Notas Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-background p-4 rounded-md border border-song-100 dark:border-song-800">
              {song.notes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SongView;
