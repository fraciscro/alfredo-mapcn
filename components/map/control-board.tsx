"use client";

import { useCallback } from "react";
import { useMap } from "@/components/ui/map";
import { Button } from "@/components/ui/button";

// Default locations for the control board
const DEFAULT_LOCATIONS = [
  { name: "O Pinto", coordinates: [-8.4563, 41.1496] as [number, number], zoom: 15 },
  { name: "Entroncamento", coordinates: [-8.4679, 39.4635] as [number, number], zoom: 12 },
];

interface Location {
  name: string;
  coordinates: [number, number];
  zoom: number;
}

interface ControlBoardProps {
  locations?: Location[];
  className?: string;
}

/**
 * ControlBoard - A floating panel with fly-to buttons for quick navigation
 * Must be used inside a Map component (uses useMap hook)
 */
export function ControlBoard({ locations = DEFAULT_LOCATIONS, className }: ControlBoardProps) {
  const { map, isLoaded } = useMap();

  const handleFlyTo = useCallback(
    (coordinates: [number, number], zoom: number) => {
      if (!map || !isLoaded) return;
      map.flyTo({
        center: coordinates,
        zoom,
        duration: 1500,
      });
    },
    [map, isLoaded]
  );

  return (
    <div
      className={`absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg border ${className || ""}`}
    >
      <h3 className="text-xs font-medium mb-2 text-muted-foreground">Fly to</h3>
      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
        {locations.map((location) => (
          <Button
            key={location.name}
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleFlyTo(location.coordinates, location.zoom)}
          >
            {location.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

