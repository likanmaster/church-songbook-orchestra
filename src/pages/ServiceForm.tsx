import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Service } from "@/types";
import { createService, getServiceById, updateService } from "@/services/service-service";
import { useAuth } from "@/hooks/use-auth-context";

const serviceFormSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres.",
  }),
  date: z.date(),
  theme: z.string().optional(),
  preacher: z.string().optional(),
  notes: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

const ServiceForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!id;
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      theme: "",
      preacher: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadService(id);
    }
  }, [isEditing, id]);

  const loadService = async (id: string) => {
    setIsLoading(true);
    try {
      // Fix here: Remove the second argument as getServiceById now expects only one parameter
      const serviceData = await getServiceById(id);
      if (serviceData) {
        form.setValue("title", serviceData.title);
        form.setValue("date", new Date(serviceData.date));
        form.setValue("theme", serviceData.theme || "");
        form.setValue("preacher", serviceData.preacher || "");
        form.setValue("notes", serviceData.notes || "");
      } else {
        toast({
          title: "Error",
          description: "Servicio no encontrado",
          variant: "destructive",
        });
        navigate("/services");
      }
    } catch (error) {
      console.error("Error al cargar el servicio:", error);
      toast({
        title: "Error",
        description: "Error al cargar los datos del servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    const { title, date, theme, preacher, notes } = data;

    const newService: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title,
      date: date.toISOString(),
      theme: theme,
      preacher: preacher,
      notes: notes,
      songs: [],
      sections: [],
      userId: user?.id || '',
      isPublic: false,
      sharedWith: []
    };

    const updatedService: Partial<Service> = {
      title: title,
      date: date.toISOString(),
      theme: theme,
      preacher: preacher,
      notes: notes,
    };

    try {
      if (isEditing && id) {
        // Fix here: Add the userId as the third argument
        await updateService(id, updatedService, user?.id || '');
        toast({
          title: "Éxito",
          description: "Servicio actualizado correctamente",
        });
      } else {
        // Fix here: Add the userId as the second argument
        await createService(newService, user?.id || '');
        toast({
          title: "Éxito",
          description: "Servicio creado correctamente",
        });
      }
      navigate("/services");
    } catch (error) {
      console.error("Error al guardar el servicio:", error);
      toast({
        title: "Error",
        description: "Error al guardar el servicio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? "Editar Servicio" : "Nuevo Servicio"}</h1>
            <p className="text-muted-foreground">
              Completa el formulario para {isEditing ? "editar" : "crear"} un nuevo servicio.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" type="text" placeholder="Título del servicio" {...form.register("title")} />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !form.getValues("date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.getValues("date") ? (
                        format(form.getValues("date"), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Controller
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      )}
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date && (
                  <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="theme">Tema</Label>
                <Input id="theme" type="text" placeholder="Tema del servicio" {...form.register("theme")} />
                {form.formState.errors.theme && (
                  <p className="text-sm text-red-500">{form.formState.errors.theme.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="preacher">Predicador</Label>
                <Input id="preacher" type="text" placeholder="Predicador del servicio" {...form.register("preacher")} />
                {form.formState.errors.preacher && (
                  <p className="text-sm text-red-500">{form.formState.errors.preacher.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" placeholder="Notas adicionales" {...form.register("notes")} />
                {form.formState.errors.notes && (
                  <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Servicio"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ServiceForm;
