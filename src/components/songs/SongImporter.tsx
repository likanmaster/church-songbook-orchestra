
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, File, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportedSongData {
  title: string;
  lyrics?: {
    full_text?: string;
  };
}

const SongImporter = () => {
  const [importType, setImportType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const processJsonSingle = async (fileContent: string) => {
    try {
      const jsonData: ImportedSongData = JSON.parse(fileContent);
      console.log("📄 [SongImporter] JSON parseado:", jsonData);
      
      // Construir la URL con solo los parámetros necesarios
      const params = new URLSearchParams();
      
      // Solo extraer título y letra
      if (jsonData.title) {
        params.set('title', jsonData.title);
        console.log("📄 [SongImporter] Agregando título:", jsonData.title);
      }
      
      // Procesar solo el full_text de la letra
      if (jsonData.lyrics?.full_text) {
        params.set('lyrics', jsonData.lyrics.full_text);
        console.log("📄 [SongImporter] Agregando letra:", jsonData.lyrics.full_text.substring(0, 100) + "...");
      }
      
      const finalUrl = `/songs/new?${params.toString()}`;
      console.log("📄 [SongImporter] URL final de navegación:", finalUrl);
      console.log("📄 [SongImporter] Parámetros construidos:", Object.fromEntries(params));
      
      // Navegar al formulario de nueva canción con los datos precargados
      navigate(finalUrl);
      
      toast({
        title: "Canción importada",
        description: `"${jsonData.title}" se ha cargado en el editor para su revisión`,
      });
      
    } catch (error) {
      console.error("📄 [SongImporter] Error al procesar JSON:", error);
      toast({
        title: "Error de formato",
        description: "El archivo JSON no tiene el formato esperado",
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
    console.log("📄 [SongImporter] Iniciando importación:", { fileName: selectedFile.name, type: importType });

    try {
      const fileContent = await selectedFile.text();
      console.log("📄 [SongImporter] Contenido del archivo leído, primeros 200 caracteres:", fileContent.substring(0, 200));

      switch (importType) {
        case "json-single":
          await processJsonSingle(fileContent);
          break;
        case "json-multiple":
          toast({
            title: "En desarrollo",
            description: "La importación de múltiples canciones JSON estará disponible próximamente",
            variant: "destructive",
          });
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
      console.error("📄 [SongImporter] Error al importar archivo:", error);
      toast({
        title: "Error de importación",
        description: "No se pudo procesar el archivo seleccionado",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
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
