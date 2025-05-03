
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChordButtonGroupProps {
  onInsertChord: (chord: string) => void;
}

const ChordButtonGroup: React.FC<ChordButtonGroupProps> = ({ onInsertChord }) => {
  const [activeTab, setActiveTab] = React.useState('major');
  
  // Definición de acordes comunes por categoría
  const chords = {
    major: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    minor: ['Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm'],
    seventh: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7'],
    sharp: ['C#', 'D#', 'F#', 'G#', 'A#'],
    flat: ['Db', 'Eb', 'Gb', 'Ab', 'Bb'],
    other: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5', 'Csus4', 'Dsus2', 'Esus4', 'Fadd9', 'Gadd9']
  };
  
  const handleInsert = (chord: string, e: React.MouseEvent) => {
    // Prevenir comportamiento predeterminado para evitar envío del formulario
    e.preventDefault();
    e.stopPropagation();
    onInsertChord(chord);
  };
  
  return (
    <div className="space-y-2">
      <Tabs defaultValue="major" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="major">Mayores</TabsTrigger>
          <TabsTrigger value="minor">Menores</TabsTrigger>
          <TabsTrigger value="seventh">7ma</TabsTrigger>
          <TabsTrigger value="sharp">#</TabsTrigger>
          <TabsTrigger value="flat">b</TabsTrigger>
          <TabsTrigger value="other">Otros</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <ScrollArea className="h-16 w-full">
        <div className="flex flex-wrap gap-1 py-1">
          {chords[activeTab as keyof typeof chords].map((chord) => (
            <Button 
              key={chord} 
              variant="outline" 
              size="sm" 
              onClick={(e) => handleInsert(chord, e)}
              className="min-w-[40px]"
              type="button" // Importante: definir el tipo como button para evitar que se envíe el formulario
            >
              {chord}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChordButtonGroup;
