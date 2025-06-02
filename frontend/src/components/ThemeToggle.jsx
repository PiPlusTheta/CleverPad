import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }) {
  // On click: cycle theme → light → dark → system → light …
  const handleToggleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  const renderThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <button
      onClick={handleToggleTheme}
      className="flex items-center gap-2 w-full p-3 rounded-lg bg-chatgpt-bg-element hover:bg-chatgpt-border text-chatgpt-text-secondary hover:text-chatgpt-text-primary transition-all duration-200 border border-chatgpt-border"
      aria-label="Toggle theme"
    >
      {renderThemeIcon()}
      <span className="text-xs capitalize font-medium">{theme} mode</span>
    </button>
  );
}
