
import React, { useState } from "react";
import { ArrowUp, ArrowDown, Refresh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/types";

interface KeyTransposerProps {
  songKey: string;
  onKeyChange: (newKey: string) => void;
}

const KeyTransposer: React.FC<KeyTransposerProps> = ({ songKey, onKeyChange }) => {
  const [semitones, setSemitones] = useState(0);
  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  const transposeKey = (originalKey: string, steps: number): string => {
    if (!originalKey) return "";
    
    const baseKey = originalKey.replace(/[mb]$/, ""); // Remove minor or flat indicator
    const modifier = originalKey.endsWith("m") ? "m" : "";
    
    let keyIndex = keys.indexOf(baseKey);
    if (keyIndex === -1) {
      // Handle flat keys by converting to sharps
      keyIndex = keys.indexOf(convertFlatToSharp(baseKey));
    }
    if (keyIndex === -1) return originalKey; // Not a valid key
    
    // Calculate new index with wrapping
    let newIndex = (keyIndex + steps) % keys.length;
    if (newIndex < 0) newIndex += keys.length;
    
    return keys[newIndex] + modifier;
  };
  
  const convertFlatToSharp = (key: string): string => {
    const flatToSharp: Record<string, string> = {
      "Db": "C#",
      "Eb": "D#",
      "Gb": "F#",
      "Ab": "G#",
      "Bb": "A#"
    };
    return flatToSharp[key] || key;
  };
  
  const handleTranspose = (direction: number) => {
    const newSemitones = semitones + direction;
    setSemitones(newSemitones);
    const newKey = transposeKey(songKey, newSemitones);
    onKeyChange(newKey);
  };
  
  const resetTransposition = () => {
    setSemitones(0);
    onKeyChange(songKey);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 text-xs py-1"
        onClick={() => handleTranspose(-1)}
      >
        <ArrowDown className="h-3 w-3" />
        <span>-1</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 text-xs py-1"
        onClick={resetTransposition}
      >
        <Refresh className="h-3 w-3" />
        <span>{semitones === 0 ? "Original" : `${semitones > 0 ? "+" : ""}${semitones}`}</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 text-xs py-1"
        onClick={() => handleTranspose(1)}
      >
        <ArrowUp className="h-3 w-3" />
        <span>+1</span>
      </Button>
    </div>
  );
};

export default KeyTransposer;
