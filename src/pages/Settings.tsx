
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Bell, Palette } from "lucide-react";
import MusicStylesManager from "@/components/settings/MusicStylesManager";
import DefaultServiceTemplateManager from "@/components/settings/DefaultServiceTemplateManager";

const Settings = () => {
  const { theme, setTheme, color, setColor } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Ajustes</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                <span>Apariencia</span>
              </CardTitle>
              <CardDescription>
                Personaliza el aspecto de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema oscuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Activa el tema oscuro para una mejor visibilidad en ambientes con poca luz
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>

              <div className="space-y-4">
                <Label>Color del tema</Label>
                <div className="flex flex-wrap gap-2">
                  {(['purple', 'blue', 'green', 'pink', 'orange'] as const).map((themeColor) => (
                    <button
                      key={themeColor}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === themeColor ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      } bg-${themeColor}-500`}
                      onClick={() => setColor(themeColor)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <DefaultServiceTemplateManager />

          <MusicStylesManager />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>Notificaciones</span>
              </CardTitle>
              <CardDescription>
                Configura tus preferencias de notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de grupos</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones cuando te inviten a un grupo
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de servicios</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones sobre los servicios en los que participas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
