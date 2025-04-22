
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

// Modo mock: siempre deja pasar
export const AuthGuard = ({ children }: AuthGuardProps) => {
  return <>{children}</>;
};
