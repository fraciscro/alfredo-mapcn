"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlBoardProps {
  onReset?: () => void;
  hasCustomPolygon?: boolean;
  className?: string;
}

/**
 * ControlBoard - A floating panel with a reset button
 * Resets the map to the default search (Entroncamento)
 */
export function ControlBoard({ onReset, hasCustomPolygon, className }: ControlBoardProps) {
  // Only show when there's a custom polygon active
  if (!hasCustomPolygon) return null;

  return (
    <div
      className={`absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg border ${className || ""}`}
    >
      <Button
        variant="outline"
        size="sm"
        className="text-xs h-8 px-3 gap-2"
        onClick={onReset}
      >
        <RotateCcw className="size-3.5" />
        Entroncamento
      </Button>
    </div>
  );
}
