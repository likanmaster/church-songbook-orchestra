
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Music } from "lucide-react";
import { Song } from "@/types";

interface SongSelectorProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export default function SongSelector({ songs, onSelectSong }: SongSelectorProps) {
  const [search, setSearch] = useState('');
  
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(search.toLowerCase()) ||
    (song.author && song.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canciones..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="border rounded-md overflow-hidden max-h-[60vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Autor</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-muted-foreground" /> 
                      <span>{song.title}</span>
                      {song.key && <Badge variant="outline" className="ml-2">{song.key}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{song.author || "-"}</TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => onSelectSong(song)} 
                      variant="ghost" 
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  No se encontraron canciones
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
