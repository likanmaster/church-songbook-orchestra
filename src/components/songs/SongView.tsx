
import { Music, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Song } from "@/types";

interface SongViewProps {
  song: Song;
}

const SongView = ({ song }: SongViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Music className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">{song.title}</h1>
          {song.isFavorite && <Heart className="h-5 w-5 ml-3 text-song-500 fill-song-500" />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Autor</p>
              <p className="font-medium">{song.author || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estilo</p>
              <p className="font-medium">{song.style || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tonalidad</p>
              <p className="font-medium">{song.key || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo</p>
              <p className="font-medium">{song.tempo ? `${song.tempo} bpm` : "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duración</p>
              <p className="font-medium">
                {song.duration
                  ? `${Math.floor(Number(song.duration) / 60)}:${String(
                      Number(song.duration) % 60
                    ).padStart(2, "0")} minutos`
                  : "No especificado"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {song.lyrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Letra</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans">{song.lyrics}</pre>
          </CardContent>
        </Card>
      )}

      {song.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{song.notes}</p>
          </CardContent>
        </Card>
      )}

      {song.categories && song.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {song.categories.map((category, index) => (
                <Badge key={index} variant="secondary">{category}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {song.tags && song.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Etiquetas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {song.tags.map((tag, index) => (
                <Badge key={index}>{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SongView;
