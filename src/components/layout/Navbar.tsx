
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Music, Search, Settings, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/ModeToggle";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: "Inicio", path: "/", icon: <Home className="h-5 w-5 mr-2" /> },
    { title: "Canciones", path: "/songs", icon: <Music className="h-5 w-5 mr-2" /> },
    { title: "Servicios", path: "/services", icon: <BookOpen className="h-5 w-5 mr-2" /> },
    { title: "Buscar", path: "/search", icon: <Search className="h-5 w-5 mr-2" /> },
    { title: "Ajustes", path: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-30">
      <div className="mx-auto px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Music className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg sm:text-xl">Church Songbook</span>
        </Link>

        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] max-w-[280px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center">
                  <Music className="h-6 w-6 text-primary mr-2" />
                  <span className="font-bold text-lg">Church Songbook</span>
                </div>
                <div className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-3 py-3 text-base hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <ModeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-4 sm:gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center hover:text-primary transition-colors text-sm sm:text-base"
              >
                {item.title}
              </Link>
            ))}
            <ModeToggle />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
