
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Songs from "./pages/Songs";
import SongForm from "./pages/SongForm";
import Services from "./pages/Services";
import ServiceForm from "./pages/ServiceForm";
import ServiceDetail from "./pages/ServiceDetail";
import Search from "./pages/Search";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/songs/new" element={<SongForm />} />
            <Route path="/songs/:id" element={<SongForm />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/new" element={<ServiceForm />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/services/:id/edit" element={<ServiceForm />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
