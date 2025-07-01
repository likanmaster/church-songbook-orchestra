import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, File, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createSong } from "@/services/song-service";
import { useAuth } from "@/hooks/use-auth-context";

interface ImportedSongData {
  title: string;
  lyrics?: {
    full_text?: string;
  };
}

interface ImportedMultipleSongsData extends Array<ImportedSongData> {}

const SongImporter = () => {
  const [importType, setImportType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentImportStatus, setCurrentImportStatus] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const processJsonSingle = async (fileContent: string) => {
    try {
      const jsonData: ImportedSongData = JSON.parse(fileContent);
      
      // Construir la URL con solo título y letra
      const params = new URLSearchParams();
      
      // Solo extraer título y full_text
      if (jsonData.title) {
        params.set('title', jsonData.title);
      }
      
      if (jsonData.lyrics?.full_text) {
        params.set('lyrics', jsonData.lyrics.full_text);
      }
      
      // Navegar al formulario de nueva canción con solo estos datos
      navigate(`/songs/new?${params.toString()}`);
      
      toast({
        title: "Canción importada",
        description: `"${jsonData.title}" se ha cargado en el editor para su revisión`,
      });
      
    } catch (error) {
      console.error("Error al procesar JSON:", error);
      toast({
        title: "Error de formato",
        description: "El archivo JSON no tiene el formato esperado",
        variant: "destructive",
      });
    }
  };

  const processJsonMultiple = async (fileContent: string) => {
    try {
      const jsonData: ImportedMultipleSongsData = JSON.parse(fileContent);
      
      if (!Array.isArray(jsonData)) {
        throw new Error("El JSON debe ser un array de canciones");
      }

      if (!user?.id) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para importar canciones",
          variant: "destructive",
        });
        return;
      }

      let importedCount = 0;
      let errorCount = 0;
      const totalSongs = jsonData.length;

      // Procesar cada canción del array
      for (let i = 0; i < jsonData.length; i++) {
        const songData = jsonData[i];
        
        try {
          // Actualizar progreso y estado
          const progress = ((i + 1) / totalSongs) * 100;
          setImportProgress(progress);
          setCurrentImportStatus(`Importando canción ${i + 1} de ${totalSongs}: ${songData.title || 'Sin título'}`);

          // Solo extraer título y full_text
          const title = songData.title?.trim();
          const lyricsText = songData.lyrics?.full_text;

          if (!title) {
            console.warn("Canción sin título omitida:", songData);
            errorCount++;
            continue;
          }

          // Crear la canción con solo título y letra
          const newSongData = {
            title,
            lyrics: lyricsText || null,
            author: null,
            key: null,
            tempo: null,
            style: null,
            duration: null,
            notes: null,
            categories: [],
            tags: [],
            isFavorite: false,
            isPublic: false,
            sharedWith: [],
            attachments: [],
            userId: user.id,
          };

          await createSong(newSongData, user.id);
          importedCount++;
          
          console.log(`✅ Canción "${title}" importada exitosamente`);
          
          // Pequeña pausa para mostrar el progreso
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (songError) {
          console.error(`❌ Error al importar canción "${songData.title}":`, songError);
          errorCount++;
        }
      }

      // Mostrar resultado final
      if (importedCount > 0) {
        toast({
          title: "Importación completada",
          description: `${importedCount} canciones importadas exitosamente${errorCount > 0 ? ` (${errorCount} errores)` : ''}`,
        });
        
        // Recargar la página para mostrar las nuevas canciones
        window.location.reload();
      } else {
        toast({
          title: "Error de importación",
          description: "No se pudo importar ninguna canción",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Error al procesar JSON múltiple:", error);
      toast({
        title: "Error de formato",
        description: "El archivo JSON no tiene el formato esperado para múltiples canciones",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !importType) {
      toast({
        title: "Datos incompletos",
        description: "Selecciona un tipo de importación y un archivo",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setCurrentImportStatus("");

    try {
      const fileContent = await selectedFile.text();

      switch (importType) {
        case "json-single":
          await processJsonSingle(fileContent);
          break;
        case "json-multiple":
          await processJsonMultiple(fileContent);
          break;
        case "word":
          toast({
            title: "En desarrollo", 
            description: "La importación de archivos Word estará disponible próximamente",
            variant: "destructive",
          });
          break;
        case "txt":
          toast({
            title: "En desarrollo",
            description: "La importación de archivos TXT estará disponible próximamente", 
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: "Tipo no soportado",
            description: "Selecciona un tipo de importación válido",
            variant: "destructive",
          });
      }
    } catch (error) {
      console.error("Error al importar archivo:", error);
      toast({
        title: "Error de importación",
        description: "No se pudo procesar el archivo seleccionado",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setCurrentImportStatus("");
    }
  };

  const getFileIcon = () => {
    switch (importType) {
      case "json-single":
      case "json-multiple":
        return <FileJson className="h-4 w-4" />;
      case "word":
        return <FileText className="h-4 w-4" />;
      case "txt":
        return <File className="h-4 w-4" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const getAcceptedFiles = () => {
    switch (importType) {
      case "json-single":
      case "json-multiple":
        return ".json";
      case "word":
        return ".doc,.docx";
      case "txt":
        return ".txt";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Canción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="import-type">Tipo de importación:</Label>
          <Select value={importType} onValueChange={setImportType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de archivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json-single">JSON (Canción única)</SelectItem>
              <SelectItem value="json-multiple">JSON (Múltiples canciones)</SelectItem>
              <SelectItem value="word">Word (.doc/.docx)</SelectItem>
              <SelectItem value="txt">Texto (.txt)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {importType && (
          <div>
            <Label htmlFor="file-input">Seleccionar archivo:</Label>
            <Input
              id="file-input"
              type="file"
              accept={getAcceptedFiles()}
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>
        )}

        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getFileIcon()}
            <span>{selectedFile.name}</span>
          </div>
        )}

        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso:</span>
              <span>{Math.round(importProgress)}%</span>
            </div>
            <Progress value={importProgress} className="w-full" />
            {currentImportStatus && (
              <p className="text-xs text-muted-foreground">{currentImportStatus}</p>
            )}
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={!selectedFile || !importType || isImporting}
          className="w-full"
        >
          {isImporting ? "Importando..." : "Importar Canción"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SongImporter;
