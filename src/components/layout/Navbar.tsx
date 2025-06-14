
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Music, Search, Settings, Home, BookOpen, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/ModeToggle";
import { ProfileButton } from "@/components/auth/ProfileButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: "Inicio", path: "/", icon: <Home className="h-5 w-5 mr-2" /> },
    { title: "Canciones", path: "/songs", icon: <Music className="h-5 w-5 mr-2" /> },
    { title: "Servicios", path: "/services", icon: <BookOpen className="h-5 w-5 mr-2" /> },
    { title: "Grupos", path: "/groups", icon: <Users className="h-5 w-5 mr-2" /> },
    { title: "Buscar", path: "/search", icon: <Search className="h-5 w-5 mr-2" /> },
    { title: "Ajustes", path: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
  ];

  const exploreItems = [
    { title: "Canciones Públicas", path: "/explore/songs", description: "Descubre canciones compartidas por la comunidad" },
    { title: "Servicios Públicos", path: "/explore/services", description: "Explora servicios compartidos por otros usuarios" },
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-30">
      <div className="mx-auto px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Music className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg sm:text-xl">Church Songbook</span>
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-2">
            <NotificationBell />
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
                    <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                      Explorar
                    </div>
                    {exploreItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center px-3 py-3 text-base hover:bg-accent rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <Globe className="h-5 w-5 mr-2" />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                  <div className="p-4 border-t flex items-center justify-between">
                    <ModeToggle />
                    <ProfileButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <ProfileButton />
          </div>
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
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="hover:text-primary transition-colors text-sm sm:text-base">
                    <Globe className="h-4 w-4 mr-1" />
                    Explorar
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                      {exploreItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="flex items-center gap-2">
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
