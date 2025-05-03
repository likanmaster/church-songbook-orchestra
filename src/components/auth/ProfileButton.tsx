
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ProfileButton = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  // If we're outside the Router context, don't try to render Link components
  const isRouterAvailable = location !== null;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        {isRouterAvailable ? (
          <>
            <Button variant="ghost" asChild size="sm">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button variant="default" asChild size="sm">
              <Link to="/register">Registrarse</Link>
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/login'}>
              Iniciar sesión
            </Button>
            <Button variant="default" size="sm" onClick={() => window.location.href = '/register'}>
              Registrarse
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{user?.username || user?.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isRouterAvailable ? (
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
