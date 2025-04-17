
import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme, color, setColor } = useTheme();

  const colorOptions = [
    { name: "Purple", value: "purple", class: "bg-[#a855f7]" },
    { name: "Blue", value: "blue", class: "bg-[#3b82f6]" },
    { name: "Green", value: "green", class: "bg-[#22c55e]" },
    { name: "Pink", value: "pink", class: "bg-[#ec4899]" },
    { name: "Orange", value: "orange", class: "bg-[#f97316]" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center">
            <Palette className="mr-2 h-4 w-4" />
            <span>Color</span>
            <div className={`ml-auto h-4 w-4 rounded-full ${colorOptions.find(c => c.value === color)?.class}`} />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {colorOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="flex items-center"
                onClick={() => setColor(option.value as any)}
              >
                <div className={`mr-2 h-4 w-4 rounded-full ${option.class}`} />
                <span>{option.name}</span>
                {color === option.value && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
