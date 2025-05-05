
import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface SectionEditorProps {
  onAddSection: (text: string) => void;
}

export default function SectionEditor({ onAddSection }: SectionEditorProps) {
  const [text, setText] = useState('');
  
  const handleAdd = () => {
    if (text.trim()) {
      onAddSection(text.trim());
      setText('');
    }
  };

  return (
    <div className="space-y-3">
      <Textarea 
        placeholder="Escribe el texto de la sección (por ejemplo: 'Bienvenida', 'Ofrenda', 'Anuncios', etc.)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[150px]"
      />
      <Button 
        onClick={handleAdd}
        disabled={!text.trim()}
        className="w-full"
      >
        <PlusCircle className="h-4 w-4 mr-2" /> 
        Añadir Sección
      </Button>
    </div>
  );
}
