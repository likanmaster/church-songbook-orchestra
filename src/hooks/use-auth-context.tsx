
import { createContext, useContext, ReactNode } from "react";

type User = {
  id: string;
  email: string;
  username: string;
};

// Modo mock: Usuario simulado siempre autenticado
const MOCK_USER: User = {
  id: "mock-1",
  email: "mockuser@example.com",
  username: "MockUser",
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Siempre autenticado, nunca carga
  const login = async () => {};
  const register = async () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider
      value={{
        user: MOCK_USER,
        isAuthenticated: true,
        isLoading: false,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
