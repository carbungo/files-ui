"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { getCookie, setCookie } from "@/hooks/use-preferences";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = getCookie("cf-theme");
    if (saved === "light") {
      setTheme("light");
      document.documentElement.classList.add("light");
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setCookie("cf-theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }

  return (
    <button
      onClick={toggle}
      className="rounded-md p-2 text-text-muted hover:bg-surface-2 hover:text-text"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
