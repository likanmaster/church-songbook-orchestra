import { useState } from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Song } from "@/types";

interface SongExporterProps {
  songs: Song[];
}

type ExportFormat = "json" | "json-simple";

const SongExporter = ({ songs }: SongExporterProps) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedSongIds(new Set(songs.map(song => song.id)));
    } else {
      setSelectedSongIds(new Set());
    }
  };

  const handleSongSelectionChange = (songId: string, checked: boolean) => {
    const newSelection = new Set(selectedSongIds);
    if (checked) {
      newSelection.add(songId);
    } else {
      newSelection.delete(songId);
    }
    setSelectedSongIds(newSelection);
    setSelectAll(newSelection.size === songs.length);
  };

  const prepareSongData = (song: Song) => {
    if (exportFormat === "json-simple") {
      return {
        title: song.title,
        author: song.author || "",
        lyrics: song.lyrics || "",
        key: song.key || "",
        style: song.style || "",
        categories: song.categories || []
      };
    }
    
    // Formato completo JSON
    return {
      title: song.title,
      author: song.author,
      lyrics: song.lyrics,
      key: song.key,
      tempo: song.tempo,
      tags: song.tags,
      categories: song.categories,
      style: song.style,
      duration: song.duration,
      notes: song.notes,
      isPublic: song.isPublic,
      isFavorite: song.isFavorite,
      rating: song.rating,
      attachments: song.attachments,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
      userId: song.userId,
      sharedWith: song.sharedWith,
      createdBy: song.createdBy,
      usageCount: song.usageCount
    };
  };

  const handleExport = () => {
    if (selectedSongIds.size === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos una canción para exportar",
        variant: "destructive",
      });
      return;
    }

    const selectedSongs = songs.filter(song => selectedSongIds.has(song.id));
    const exportData = selectedSongs.map(prepareSongData);

    // Crear el archivo JSON
    const dataToExport = selectedSongs.length === 1 ? exportData[0] : exportData;
    const jsonString = JSON.stringify(dataToExport, null, 2);
    
    // Crear y descargar el archivo
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const fileName = selectedSongs.length === 1 
      ? `${selectedSongs[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      : `canciones_export_${new Date().toISOString().split('T')[0]}.json`;
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportación exitosa",
      description: `${selectedSongs.length} ${selectedSongs.length === 1 ? 'canción exportada' : 'canciones exportadas'} correctamente`,
    });
  };

  const getFormatDescription = () => {
    switch (exportFormat) {
      case "json-simple":
        return "Formato simplificado con campos básicos (título, autor, letra, tonalidad, estilo, categorías)";
      case "json":
        return "Formato completo con todos los campos disponibles";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Canciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formato de exportación */}
        <div>
          <label className="text-sm font-medium mb-2 block">Formato de exportación:</label>
          <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON Completo</SelectItem>
              <SelectItem value="json-simple">JSON Simplificado</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {getFormatDescription()}
          </p>
        </div>

        {/* Selección de canciones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Seleccionar canciones:</label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAllChange}
              />
              <label htmlFor="select-all" className="text-sm">
                Seleccionar todas ({songs.length})
              </label>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
            {songs.map((song) => (
              <div key={song.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`song-${song.id}`}
                  checked={selectedSongIds.has(song.id)}
                  onCheckedChange={(checked) => handleSongSelectionChange(song.id, checked as boolean)}
                />
                <label htmlFor={`song-${song.id}`} className="text-sm flex-1 cursor-pointer">
                  <span className="font-medium">{song.title}</span>
                  {song.author && <span className="text-muted-foreground"> - {song.author}</span>}
                  {song.key && <span className="text-muted-foreground"> ({song.key})</span>}
                </label>
              </div>
            ))}
          </div>

          {selectedSongIds.size > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {selectedSongIds.size} {selectedSongIds.size === 1 ? 'canción seleccionada' : 'canciones seleccionadas'}
            </p>
          )}
        </div>

        {/* Botón de exportación */}
        <div className="flex justify-end">
          <Button 
            onClick={handleExport}
            disabled={selectedSongIds.size === 0}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar {selectedSongIds.size > 0 && `(${selectedSongIds.size})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongExporter;