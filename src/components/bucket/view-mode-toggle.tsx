"use client";

import { useState, useEffect } from "react";
import { List, Grid3x3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/hooks/use-preferences";

export function ViewModeToggle() {
  const router = useRouter();
  const [mode, setMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const saved = getCookie("cf-view-mode");
    if (saved === "grid") setMode("grid");
  }, []);

  function toggle() {
    const next = mode === "list" ? "grid" : "list";
    setMode(next);
    setCookie("cf-view-mode", next);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className="rounded-md p-2 text-text-muted hover:bg-surface-2 hover:text-text"
      aria-label="Toggle view mode"
    >
      {mode === "list" ? <Grid3x3 size={18} /> : <List size={18} />}
    </button>
  );
}
