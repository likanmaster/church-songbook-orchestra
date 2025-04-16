
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Music, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/ModeToggle";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: "Inicio", path: "/", icon: <Music className="h-5 w-5 mr-2" /> },
    { title: "Canciones", path: "/songs", icon: <Music className="h-5 w-5 mr-2" /> },
    { title: "Servicios", path: "/services", icon: <Music className="h-5 w-5 mr-2" /> },
    { title: "Buscar", path: "/search", icon: <Search className="h-5 w-5 mr-2" /> },
    { title: "Ajustes", path: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Music className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:block">Church Songbook</span>
        </Link>

        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px]">
              <div className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-4 py-2 text-lg hover:bg-accent rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center hover:text-primary transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
        
        <div className="flex items-center">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
