
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

type User = {
  id: string;
  email: string;
  username: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is a mock implementation - in a real app, validate credentials with a backend
      if (email === "demo@example.com" && password === "password") {
        const mockUser = {
          id: "1",
          email: "demo@example.com",
          username: "demo",
        };
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        return;
      }
      
      // Check if there's a registered user
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const foundUser = registeredUsers.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const loggedInUser = {
          id: foundUser.id,
          email: foundUser.email,
          username: foundUser.username,
        };
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password. Try using demo@example.com / password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function - in a real app, this would call an API
  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      if (registeredUsers.some((u: any) => u.email === email)) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "Email already in use.",
        });
        setIsLoading(false);
        return;
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        username,
        password, // In a real app, NEVER store passwords in plain text
      };
      
      registeredUsers.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
      
      // Log the user in
      const loggedInUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      };
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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
