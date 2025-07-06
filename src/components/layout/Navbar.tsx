
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
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl group-hover:scale-105 transition-transform">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Church Songbook
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
                <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
                  <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Music className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-white">Menu</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
                    {menuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-all",
                          isActiveRoute(item.path)
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                            : "hover:bg-slate-100 text-slate-700"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t bg-slate-50 flex items-center justify-between">
                    <ModeToggle />
                    <ProfileButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActiveRoute(item.path)
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                    : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
            
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
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
