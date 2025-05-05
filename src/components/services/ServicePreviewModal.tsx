
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, X, Music } from "lucide-react";
import type { Service, ServiceSong, ServiceSection } from "@/types";

type SongOption = { id: string; title: string; key: string };

interface ServiceItem {
  type: 'song' | 'section';
  order: number;
  content: any;
}

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

  // Combine songs and sections into a single ordered list
  const createOrderedItems = () => {
    const items: ServiceItem[] = [];
    
    // Add songs
    if (service.songs && service.songs.length > 0) {
      service.songs.forEach((song: ServiceSong) => {
        items.push({
          type: 'song',
          order: song.order,
          content: {
            ...song,
            details: getSongDetails(song.songId)
          }
        });
      });
    }
    
    // Add sections
    if (service.sections && service.sections.length > 0) {
      service.sections.forEach((section: ServiceSection) => {
        items.push({
          type: 'section',
          order: section.order,
          content: section
        });
      });
    }
    
    // Sort by order
    return items.sort((a, b) => a.order - b.order);
  };
  
  const orderedItems = createOrderedItems();

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
            <span className="font-medium">Orden del Servicio:</span>
            <ul className="mt-1 ml-4 list-disc">
              {orderedItems.map((item, idx) => {
                if (item.type === 'song') {
                  const songDetails = item.content.details;
                  return (
                    <li key={item.content.id || idx} className="flex items-center">
                      <span className="mr-2 bg-primary/10 text-primary text-xs px-1.5 rounded-full">
                        {item.order}
                      </span>
                      <span className="font-semibold">{songDetails ? songDetails.title : "Canción desconocida"}</span>
                      {songDetails?.key && <span className="ml-2 text-sm text-muted-foreground">(Tonalidad: {songDetails.key})</span>}
                      <Music className="ml-2 h-3 w-3 text-muted-foreground" />
                    </li>
                  );
                } else {
                  return (
                    <li key={item.content.id || `section-${idx}`} className="flex items-center">
                      <span className="mr-2 bg-secondary/10 text-secondary text-xs px-1.5 rounded-full">
                        {item.order}
                      </span>
                      <span className="italic">{item.content.text}</span>
                    </li>
                  );
                }
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
