"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMap } from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X } from "lucide-react";
import MapLibreDraw from "maplibre-gl-draw";
import "maplibre-gl-draw/dist/mapbox-gl-draw.css";

// Types for draw events
export interface DrawnFeature {
  id: string;
  type: "Feature";
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: Record<string, unknown>;
}

interface DrawEvent {
  features: DrawnFeature[];
}

interface ModeChangeEvent {
  mode: string;
}

interface DrawControlProps {
  /** Callback when a shape is drawn */
  onDrawCreate?: (features: DrawnFeature[]) => void;
  /** Callback when a shape is updated */
  onDrawUpdate?: (features: DrawnFeature[]) => void;
  /** Callback when a shape is deleted */
  onDrawDelete?: (features: DrawnFeature[]) => void;
  /** Position of the control */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

// Custom styles for the draw control to match your theme
const drawStyles = [
  // Polygon fill - active (being drawn)
  {
    id: "gl-draw-polygon-fill-active",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
    paint: {
      "fill-color": "#009de0",
      "fill-opacity": 0.15,
    },
  },
  // Polygon fill - inactive (completed)
  {
    id: "gl-draw-polygon-fill-inactive",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
    paint: {
      "fill-color": "#009de0",
      "fill-opacity": 0.1,
    },
  },
  // Polygon outline - active
  {
    id: "gl-draw-polygon-stroke-active",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
    paint: {
      "line-color": "#009de0",
      "line-width": 2,
      "line-dasharray": [2, 2],
    },
  },
  // Polygon outline - inactive
  {
    id: "gl-draw-polygon-stroke-inactive",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
    paint: {
      "line-color": "#009de0",
      "line-width": 2,
    },
  },
  // Vertex points - active
  {
    id: "gl-draw-point-active",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"], ["==", "active", "true"]],
    paint: {
      "circle-radius": 6,
      "circle-color": "#fff",
      "circle-stroke-color": "#009de0",
      "circle-stroke-width": 2,
    },
  },
  // Vertex points - inactive
  {
    id: "gl-draw-point-inactive",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"], ["==", "active", "false"]],
    paint: {
      "circle-radius": 5,
      "circle-color": "#fff",
      "circle-stroke-color": "#009de0",
      "circle-stroke-width": 2,
    },
  },
  // Midpoints
  {
    id: "gl-draw-point-midpoint",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 4,
      "circle-color": "#009de0",
      "circle-opacity": 0.8,
    },
  },
];

/**
 * DrawControl - Polygon drawing functionality for MapLibre
 */
export function DrawControl({
  onDrawCreate,
  onDrawUpdate,
  onDrawDelete,
  position = "top-left",
}: DrawControlProps) {
  const { map, isLoaded } = useMap();
  const drawRef = useRef<MapLibreDraw | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasPolygon, setHasPolygon] = useState(false);

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-20 left-4",
    "bottom-right": "bottom-20 right-4",
  };

  // Initialize draw control
  useEffect(() => {
    if (!map || !isLoaded) return;

    const drawControl = new MapLibreDraw({
      displayControlsDefault: false,
      controls: {},
      styles: drawStyles,
    });

    // Store in ref
    drawRef.current = drawControl;

    // Add the control to the map (but hide default UI)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.addControl(drawControl as unknown as any, "top-left");

    // Event handlers
    const handleDrawCreate = (e: DrawEvent) => {
      const features = e.features;
      console.log("🎨 Polygon created:", features);
      console.log("📍 Coordinates:", features[0]?.geometry?.coordinates);
      setHasPolygon(true);
      setIsDrawing(false);
      onDrawCreate?.(features);
    };

    const handleDrawUpdate = (e: DrawEvent) => {
      const features = e.features;
      console.log("✏️ Polygon updated:", features);
      console.log("📍 Coordinates:", features[0]?.geometry?.coordinates);
      onDrawUpdate?.(features);
    };

    const handleDrawDelete = (e: DrawEvent) => {
      const features = e.features;
      console.log("🗑️ Polygon deleted:", features);
      setHasPolygon(drawControl.getAll().features.length > 0);
      onDrawDelete?.(features);
    };

    const handleModeChange = (e: ModeChangeEvent) => {
      setIsDrawing(e.mode === "draw_polygon");
    };

    map.on("draw.create", handleDrawCreate);
    map.on("draw.update", handleDrawUpdate);
    map.on("draw.delete", handleDrawDelete);
    map.on("draw.modechange", handleModeChange);

    return () => {
      map.off("draw.create", handleDrawCreate);
      map.off("draw.update", handleDrawUpdate);
      map.off("draw.delete", handleDrawDelete);
      map.off("draw.modechange", handleModeChange);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.removeControl(drawControl as unknown as any);
      drawRef.current = null;
    };
  }, [map, isLoaded, onDrawCreate, onDrawUpdate, onDrawDelete]);

  // Start drawing polygon
  const handleStartDraw = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_polygon");
    setIsDrawing(true);
  }, []);

  // Cancel drawing
  const handleCancelDraw = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("simple_select");
    setIsDrawing(false);
  }, []);

  // Delete all polygons
  const handleDelete = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
    setHasPolygon(false);
    setIsDrawing(false);
    console.log("🗑️ All polygons cleared");
  }, []);

  return (
    <div
      className={`absolute ${positionClasses[position]} z-10 flex gap-1.5 transition-all duration-300 ease-out`}
    >
      {/* Draw button */}
      <Button
        variant={isDrawing ? "default" : "secondary"}
        size="sm"
        className={`
          h-9 px-3 shadow-lg border backdrop-blur-sm
          transition-all duration-200 ease-out
          ${
            isDrawing
              ? "bg-primary text-primary-foreground scale-105"
              : "bg-background/90 hover:bg-background hover:scale-105"
          }
        `}
        onClick={isDrawing ? handleCancelDraw : handleStartDraw}
        title={isDrawing ? "Cancel drawing" : "Draw polygon"}
      >
        {isDrawing ? (
          <>
            <X className="size-4 mr-1.5" />
            <span className="text-xs font-medium">Cancel</span>
          </>
        ) : (
          <>
            <Pencil className="size-4 mr-1.5" />
            <span className="text-xs font-medium">Draw</span>
          </>
        )}
      </Button>

      {/* Delete button - only show when there's a polygon */}
      <div
        className={`
          transition-all duration-300 ease-out overflow-hidden
          ${hasPolygon ? "w-auto opacity-100 scale-100" : "w-0 opacity-0 scale-95"}
        `}
      >
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-3 shadow-lg border backdrop-blur-sm bg-background/90 hover:bg-destructive hover:text-destructive-foreground hover:scale-105 transition-all duration-200"
          onClick={handleDelete}
          title="Delete polygon"
        >
          <Trash2 className="size-4 mr-1.5" />
          <span className="text-xs font-medium">Clear</span>
        </Button>
      </div>

      {/* Drawing hint */}
      {isDrawing && (
        <div className="absolute top-full left-0 mt-2 px-3 py-1.5 bg-foreground text-background text-xs rounded-md shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
          Click to add points, double-click to finish
        </div>
      )}
    </div>
  );
}
