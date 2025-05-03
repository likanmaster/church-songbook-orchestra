
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth-context";
import Navbar from "@/components/layout/Navbar";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container flex items-center justify-center min-h-[calc(100vh-70px)] py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="tu@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="******"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-full px-3"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">&#9696;</span>
                      Procesando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn size={18} />
                      Iniciar sesión
                    </div>
                  )}
                </Button>
              </form>
            </Form>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              <p>Demo credentials: demo@example.com / password</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Regístrate
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Login;
