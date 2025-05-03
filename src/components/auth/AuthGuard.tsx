import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth-context";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

// Modo mock: siempre deja pasar
export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login if authentication is required but user is not authenticated
        navigate("/login");
      } else if (!requireAuth && isAuthenticated) {
        // Redirect to home if user is already authenticated but trying to access login/register pages
        navigate("/");
      }
    }
  }, [isAuthenticated, isLoading, navigate, requireAuth]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If requireAuth is true and user is not authenticated, return null (redirect will happen in useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If requireAuth is false and user is authenticated, return null (redirect will happen in useEffect)
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Otherwise, render children
  return <>{children}</>;
};
