
import React from "react";
import RichTextDisplay from "./RichTextDisplay";

interface ChordLyricsProps {
  lyrics: string;
  showChords: boolean;
  transposedKey?: string;
  originalKey?: string;
}

const ChordLyrics: React.FC<ChordLyricsProps> = ({ lyrics, showChords, transposedKey, originalKey }) => {
  // Verificar si el contenido es HTML (texto enriquecido)
  const isRichText = lyrics.includes('<') && lyrics.includes('>');
  
  if (isRichText) {
    // Renderizar texto enriquecido
    return (
      <div className="rich-lyrics-container">
        <RichTextDisplay content={lyrics} />
      </div>
    );
  }

  // Función para procesar las letras y acordes (modo simple)
  const processLyrics = (text: string) => {
    if (!text) return [];
    
    // Expresión regular para identificar acordes entre corchetes
    const chordPattern = /\[(.*?)\]/g;
    
    // Dividimos el texto por líneas
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const segments = [];
      let lastIndex = 0;
      let match;
      
      // Encuentra todos los acordes en la línea
      while ((match = chordPattern.exec(line)) !== null) {
        const chord = match[1];
        const chordIndex = match.index;
        
        // Añadir texto antes del acorde
        if (chordIndex > lastIndex) {
          segments.push({
            type: 'text',
            content: line.substring(lastIndex, chordIndex)
          });
        }
        
        // Añadir el acorde
        segments.push({
          type: 'chord',
          content: chord
        });
        
        // Actualizar el último índice (saltando los corchetes del acorde)
        lastIndex = chordIndex + match[0].length;
      }
      
      // Añadir el texto restante después del último acorde
      if (lastIndex < line.length) {
        segments.push({
          type: 'text',
          content: line.substring(lastIndex)
        });
      }
      
      // Si no hay segmentos, consideramos que toda la línea es texto
      if (segments.length === 0 && line.length > 0) {
        segments.push({
          type: 'text',
          content: line
        });
      }
      
      return {
        segments,
        lineIndex
      };
    });
  };
  
  const processedLyrics = processLyrics(lyrics);
  
  return (
    <div className="font-mono">
      {processedLyrics.map((line, lineIndex) => (
        <div key={lineIndex} className="mb-1 relative">
          {/* Renderizamos cada línea con sus acordes y texto */}
          <div className="flex flex-wrap items-start">
            {line.segments.map((segment, segmentIndex) => (
              <div key={segmentIndex} className="relative">
                {segment.type === 'chord' && showChords && (
                  <div className="absolute -bottom-3 text-primary font-bold text-sm">
                    {segment.content}
                  </div>
                )}
                <span>
                  {segment.type === 'chord' ? '' : segment.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChordLyrics;
