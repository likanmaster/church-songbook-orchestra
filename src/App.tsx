import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth-context";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Songs from "./pages/Songs";
import SongForm from "./pages/SongForm";
import Services from "./pages/Services";
import ServiceForm from "./pages/ServiceForm";
import ServiceDetail from "./pages/ServiceDetail";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import { AuthGuard } from "@/components/auth/AuthGuard";
import GroupDetail from "./pages/GroupDetail";
import GroupInvite from "./pages/GroupInvite";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/songs" 
                element={
                  <AuthGuard>
                    <Songs />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/songs/new" 
                element={
                  <AuthGuard>
                    <SongForm />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/songs/:id" 
                element={
                  <AuthGuard>
                    <SongForm />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/services" 
                element={
                  <AuthGuard>
                    <Services />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/services/new" 
                element={
                  <AuthGuard>
                    <ServiceForm />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/services/:id" 
                element={
                  <AuthGuard>
                    <ServiceDetail />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/services/:id/edit" 
                element={
                  <AuthGuard>
                    <ServiceForm />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <AuthGuard>
                    <Search />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <AuthGuard requireAuth={false}>
                    <Login />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <AuthGuard requireAuth={false}>
                    <Register />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/groups" 
                element={
                  <AuthGuard>
                    <Groups />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/groups/:id" 
                element={
                  <AuthGuard>
                    <GroupDetail />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/groups/:id/invite" 
                element={
                  <AuthGuard>
                    <GroupInvite />
                  </AuthGuard>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
