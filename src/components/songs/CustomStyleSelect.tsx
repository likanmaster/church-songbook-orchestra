
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomStyleSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

const CustomStyleSelect = ({ value, onChange, placeholder = "Selecciona estilo musical" }: CustomStyleSelectProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newStyle, setNewStyle] = useState('');
  const [customStyles, setCustomStyles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Estilos musicales predefinidos
  const predefinedStyles = [
    "Contemporáneo", "Himno", "Gospel", "Balada", "Rock", 
    "Pop", "Acústico", "Coral", "Jazz", "Folk"
  ];

  // Cargar estilos personalizados del localStorage al iniciar
  useEffect(() => {
    const savedStyles = localStorage.getItem('customMusicStyles');
    if (savedStyles) {
      try {
        setCustomStyles(JSON.parse(savedStyles));
      } catch (e) {
        console.error('Error loading custom styles', e);
        setCustomStyles([]);
      }
    }
  }, []);

  // Guardar estilos personalizados en localStorage cuando se actualicen
  useEffect(() => {
    if (customStyles.length > 0) {
      localStorage.setItem('customMusicStyles', JSON.stringify(customStyles));
    }
  }, [customStyles]);

  // Enfocar el input cuando se activa
  useEffect(() => {
    if (isAddingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingNew]);

  const handleAddStyle = () => {
    if (newStyle.trim() !== '') {
      const styleToAdd = newStyle.trim();
      
      // Verificar que no exista ya
      if (!predefinedStyles.includes(styleToAdd) && !customStyles.includes(styleToAdd)) {
        const updatedStyles = [...customStyles, styleToAdd];
        setCustomStyles(updatedStyles);
        onChange(styleToAdd);
      }
      
      setNewStyle('');
      setIsAddingNew(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStyle();
    } else if (e.key === 'Escape') {
      setIsAddingNew(false);
      setNewStyle('');
    }
  };

  return (
    <div className="relative">
      {!isAddingNew ? (
        <Select 
          value={value || ""} 
          onValueChange={(val) => onChange(val || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <div className="p-1">
              <Button 
                variant="ghost" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsAddingNew(true);
                }} 
                className="w-full justify-start text-sm mb-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir estilo personalizado
              </Button>
            </div>
            
            {predefinedStyles.length > 0 && (
              <div className="py-1">
                <p className="px-2 text-xs text-muted-foreground font-medium">Estilos predefinidos</p>
                {predefinedStyles.map((style) => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </div>
            )}
            
            {customStyles.length > 0 && (
              <div className="py-1">
                <p className="px-2 text-xs text-muted-foreground font-medium">Mis estilos personalizados</p>
                {customStyles.map((style) => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </div>
            )}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex w-full space-x-2">
          <Input
            ref={inputRef}
            placeholder="Escribe un nuevo estilo"
            value={newStyle}
            onChange={(e) => setNewStyle(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-grow"
          />
          <Button size="sm" onClick={handleAddStyle}>
            Añadir
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setIsAddingNew(false);
              setNewStyle('');
            }}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomStyleSelect;
