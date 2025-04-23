
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import type { Service, ServiceSong } from "@/types";

type SongOption = { id: string; title: string; key: string };

type ServicePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  service: Service | null;
  songLibrary: SongOption[];
};

export default function ServicePreviewModal({
  open,
  onClose,
  onSave,
  service,
  songLibrary,
}: ServicePreviewModalProps) {
  if (!service) return null;

  function getSongDetails(songId: string) {
    return songLibrary.find((s) => s.id === songId);
  }

  // Sort songs by order
  const sortedSongs = [...service.songs].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Previsualizar Servicio</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{service.title}</h2>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(service.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </span>
            {service.theme && <span className="ml-4 italic">Tema: {service.theme}</span>}
          </div>
          {service.preacher && (
            <div>
              <span className="font-medium">Predicador:</span> {service.preacher}
            </div>
          )}
          <div>
            <span className="font-medium">Canciones:</span>
            <ul className="mt-1 ml-4 list-disc">
              {sortedSongs.map((s, idx) => {
                const song = getSongDetails(s.songId);
                return (
                  <li key={s.id || idx}>
                    <span className="font-semibold">{song ? song.title : "Canción desconocida"}</span>
                    {song?.key && <span className="ml-2 text-sm text-muted-foreground">(Tonalidad: {song.key})</span>}
                  </li>
                );
              })}
            </ul>
          </div>
          {service.notes && (
            <div className="text-sm italic text-muted-foreground mt-2">
              "{service.notes}"
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose} variant="ghost">
            <X className="w-4 h-4 mr-2" /> Cerrar
          </Button>
          <Button onClick={onSave} variant="default">
            Guardar Servicio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
