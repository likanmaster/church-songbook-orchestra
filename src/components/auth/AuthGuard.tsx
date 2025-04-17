
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth-context";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip redirect during loading
    if (isLoading) return;

    // Redirect to login if auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      navigate("/login");
    }
    
    // Redirect to home if user is already authenticated but tries to access login/register
    if (!requireAuth && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate, requireAuth]);

  // Show nothing while checking authentication
  if (isLoading) return null;

  // Don't render children if authentication check fails
  if (requireAuth && !isAuthenticated) return null;
  if (!requireAuth && isAuthenticated) return null;

  // If we get here, we're good to render the children
  return <>{children}</>;
};
