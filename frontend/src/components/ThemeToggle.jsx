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
        return <Sun className="w-5 h-5" />;
      case "dark":
        return <Moon className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <button
      onClick={handleToggleTheme}
      className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
      aria-label="Toggle theme"
    >
      {renderThemeIcon()}
      <span className="text-xs capitalize">{theme}</span>
    </button>
  );
}
