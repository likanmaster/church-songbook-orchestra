
import { Link } from "react-router-dom";
import { Song } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";

interface GroupSongsTabProps {
  songs: Song[];
}

const GroupSongsTab = ({ songs }: GroupSongsTabProps) => {
  if (songs.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No hay canciones compartidas</h3>
        <p className="text-muted-foreground">
          Este grupo aún no tiene canciones compartidas
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {songs.map((song) => (
        <Link to={`/songs/${song.id}`} key={song.id}>
          <Card className="h-full hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                {song.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{song.author}</p>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default GroupSongsTab;
