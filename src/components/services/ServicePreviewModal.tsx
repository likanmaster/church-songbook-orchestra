
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import type { Service } from "@/types";

type ServicePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  service: Service | null;
};

export default function ServicePreviewModal({
  open,
  onClose,
  onSave,
  service,
}: ServicePreviewModalProps) {
  if (!service) return null;
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
              {service.songs.map((s, idx) => (
                <li key={s.id || idx}>
                  <span className="font-semibold">{s.title}</span>
                  {s.key && <span className="ml-2 text-sm text-muted-foreground">(Tonalidad: {s.key})</span>}
                </li>
              ))}
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
