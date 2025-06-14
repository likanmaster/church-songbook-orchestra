
import { useState, useEffect } from "react";
import { Search, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Song } from "@/types";
import { getAllSongs } from "@/services/song-service";
import { useAuth } from "@/hooks/use-auth-context";

interface SongSearchProps {
  onSelect: (song: Song) => void;
}

const SongSearch = ({ onSelect }: SongSearchProps) => {
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadSongs();
  }, [user]);

  useEffect(() => {
    if (search.trim()) {
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(search.toLowerCase()) ||
        (song.author && song.author.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredSongs(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setFilteredSongs([]);
    }
  }, [search, songs]);

  const loadSongs = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const songsData = await getAllSongs(user.id);
      // Only show user's own songs
      const userSongs = songsData.filter(song => song.userId === user.id);
      setSongs(userSongs);
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSong = (song: Song) => {
    onSelect(song);
    setSearch("");
    setFilteredSongs([]);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredSongs.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredSongs.map((song) => (
                <Button
                  key={song.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-2"
                  onClick={() => handleSelectSong(song)}
                >
                  <div className="flex items-center w-full">
                    <Music className="mr-2 h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{song.title}</div>
                      {song.author && (
                        <div className="text-sm text-muted-foreground">{song.author}</div>
                      )}
                    </div>
                    {song.key && (
                      <Badge variant="outline" className="ml-2">
                        {song.key}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {search.trim() && filteredSongs.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No se encontraron canciones
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SongSearch;
