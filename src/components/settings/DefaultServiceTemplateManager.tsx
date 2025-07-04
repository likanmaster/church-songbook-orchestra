
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, FileText, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";
import { 
  getUserDefaultServiceTemplate, 
  updateUserDefaultServiceTemplate,
  type DefaultServiceTemplate 
} from "@/services/user-service";
import { v4 as uuidv4 } from 'uuid';

const DefaultServiceTemplateManager = () => {
  const [template, setTemplate] = useState<DefaultServiceTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadTemplate();
    }
  }, [user]);

  const loadTemplate = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const userTemplate = await getUserDefaultServiceTemplate(user.id);
      setTemplate(userTemplate);
    } catch (error) {
      console.error("Error al cargar plantilla:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la plantilla de servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user?.id || !template) return;
    
    try {
      setIsLoading(true);
      await updateUserDefaultServiceTemplate(user.id, template);
      toast({
        title: "Éxito",
        description: "Plantilla de servicio guardada correctamente",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla de servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      await updateUserDefaultServiceTemplate(user.id, null);
      setTemplate(null);
      setIsEditing(false);
      toast({
        title: "Éxito",
        description: "Plantilla de servicio eliminada",
      });
    } catch (error) {
      console.error("Error al eliminar plantilla:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla de servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTemplate = () => {
    const newTemplate: DefaultServiceTemplate = {
      title: "Mi Plantilla de Servicio",
      sections: [
        { id: uuidv4(), text: "Inicio del servicio", type: 'section' },
        { id: uuidv4(), text: "Primera oración", type: 'section' },
        { id: uuidv4(), text: "Tiempo de alabanza", type: 'section' },
        { id: uuidv4(), text: "Predicación", type: 'section' },
        { id: uuidv4(), text: "Oración final", type: 'section' },
        { id: uuidv4(), text: "Fin del servicio", type: 'section' }
      ]
    };
    setTemplate(newTemplate);
    setIsEditing(true);
  };

  const addSection = () => {
    if (!template) return;
    
    const newSection = {
      id: uuidv4(),
      text: "",
      type: 'section' as const
    };
    
    setTemplate({
      ...template,
      sections: [...template.sections, newSection]
    });
  };

  const updateSection = (id: string, text: string) => {
    if (!template) return;
    
    setTemplate({
      ...template,
      sections: template.sections.map(section =>
        section.id === id ? { ...section, text } : section
      )
    });
  };

  const removeSection = (id: string) => {
    if (!template) return;
    
    setTemplate({
      ...template,
      sections: template.sections.filter(section => section.id !== id)
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantilla de Servicio Predeterminada</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Plantilla de Servicio Predeterminada</span>
        </CardTitle>
        <CardDescription>
          Configura una plantilla que se usará automáticamente al crear nuevos servicios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!template ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No tienes una plantilla de servicio configurada
            </p>
            <Button onClick={createNewTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Plantilla
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="template-title">Nombre de la plantilla</Label>
                  <Input
                    id="template-title"
                    value={template.title}
                    onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Secciones del servicio</Label>
                  <div className="space-y-2 mt-2">
                    {template.sections.map((section, index) => (
                      <div key={section.id} className="flex items-center gap-2">
                        <Badge variant="outline" className="min-w-fit">
                          {index + 1}
                        </Badge>
                        <Input
                          placeholder="Nombre de la sección"
                          value={section.text}
                          onChange={(e) => updateSection(section.id, e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSection(section.id)}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addSection}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Sección
                  </Button>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveTemplate} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Plantilla
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Plantilla actual: {template.title}</Label>
                  <div className="mt-2 space-y-1">
                    {template.sections.map((section, index) => (
                      <div key={section.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="min-w-fit">
                          {index + 1}
                        </Badge>
                        <span>{section.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    Editar Plantilla
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteTemplate}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Plantilla
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DefaultServiceTemplateManager;
