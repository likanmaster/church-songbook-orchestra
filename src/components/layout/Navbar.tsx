
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Music, Search, Settings, Home, BookOpen, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/ModeToggle";
import { ProfileButton } from "@/components/auth/ProfileButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { title: "Inicio", path: "/", icon: <Home className="h-4 w-4" /> },
    { title: "Canciones", path: "/songs", icon: <Music className="h-4 w-4" /> },
    { title: "Servicios", path: "/services", icon: <BookOpen className="h-4 w-4" /> },
    { title: "Grupos", path: "/groups", icon: <Users className="h-4 w-4" /> },
    { title: "Explorar", path: "/search", icon: <Search className="h-4 w-4" /> },
    { title: "Ajustes", path: "/settings", icon: <Settings className="h-4 w-4" /> },
  ];

  const isActiveRoute = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="border-b border-border/50 glass sticky top-0 z-50">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group interactive-scale">
          <div className="p-2 bg-gradient-primary rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Music className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gradient">
            Music Team
          </span>
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] max-w-[320px] p-0">
                <div className="flex flex-col h-full bg-gradient-soft">
                  <div className="p-6 border-b bg-gradient-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Music className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">Menu</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white/20 rounded-xl"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 p-6 flex-1 overflow-y-auto">
                    {menuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-4 px-5 py-4 text-lg font-medium rounded-xl transition-all duration-300 interactive-lift",
                          isActiveRoute(item.path)
                            ? "bg-gradient-primary text-white shadow-lg"
                            : "hover:bg-muted text-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="p-6 border-t bg-muted/30 flex items-center justify-between">
                    <ModeToggle />
                    <ProfileButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 interactive-lift",
                  isActiveRoute(item.path)
                    ? "bg-gradient-primary text-white shadow-lg"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
            
            <div className="flex items-center gap-3 ml-6 pl-6 border-l border-border">
              <NotificationBell />
              <ModeToggle />
              <ProfileButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
