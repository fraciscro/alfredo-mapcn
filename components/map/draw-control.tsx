"use client";

import { Pencil, Trash2, Square, Circle } from "lucide-react";
import { useCallback, useState } from "react";
import { useMap } from "@/components/ui/map";
import { Button } from "@/components/ui/button";

// polygonString example:
// [[[-9.160033727247793,38.74725769490851],[-9.156766427302102,38.73904630967604],[-9.140248410909635,38.73621457858664],[-9.128994377763348,38.739187893283],[-9.12137067789007,38.75079679386502],[-9.128812861100073,38.75631743790461],[-9.14533087749183,38.75844064884171],[-9.160033727247793,38.74725769490851],[-9.160033727247793,38.74725769490851]]]

/**
 * ========================================
 * DRAW CONTROL - MapLibre Drawing Alternatives
 * ========================================
 *
 * Since you're using MapLibre (via mapcn), here are the best alternatives
 * to @mapbox/mapbox-gl-draw:
 *
 * 1. **maplibre-gl-draw** (Recommended - Drop-in replacement)
 *    - Fork of mapbox-gl-draw for MapLibre
 *    - Same API as mapbox-gl-draw
 *    - npm: https://www.npmjs.com/package/@maplibre/maplibre-gl-draw
 *    - GitHub: https://github.com/birkskyum/maplibre-gl-draw
 *
 *    Installation:
 *    ```
 *    npm install @maplibre/maplibre-gl-draw
 *    ```
 *
 * 2. **terra-draw** (Modern, Framework-agnostic)
 *    - Works with multiple map libraries (MapLibre, Leaflet, Google Maps, etc.)
 *    - Modern TypeScript-first design
 *    - More drawing modes and customization
 *    - npm: https://www.npmjs.com/package/terra-draw
 *    - Docs: https://terradraw.io/
 *
 *    Installation:
 *    ```
 *    npm install terra-draw
 *    ```
 *
 * 3. **Custom Implementation** (For simple use cases)
 *    - Use MapLibre's native events (mousedown, mousemove, mouseup)
 *    - Full control over UX and styling
 *    - More work but no external dependencies
 *
 * ========================================
 * USAGE EXAMPLE WITH maplibre-gl-draw:
 * ========================================
 *
 * ```tsx
 * import MaplibreDraw from '@maplibre/maplibre-gl-draw';
 * import '@maplibre/maplibre-gl-draw/dist/maplibre-gl-draw.css';
 *
 * function DrawControl({ onDrawCreate, onDrawDelete }) {
 *   const { map, isLoaded } = useMap();
 *   const [draw, setDraw] = useState<MaplibreDraw | null>(null);
 *
 *   useEffect(() => {
 *     if (!map || !isLoaded) return;
 *
 *     const drawControl = new MaplibreDraw({
 *       displayControlsDefault: false,
 *       controls: {
 *         polygon: true,
 *         trash: true,
 *       },
 *     });
 *
 *     map.addControl(drawControl, 'top-left');
 *     setDraw(drawControl);
 *
 *     map.on('draw.create', (e) => onDrawCreate?.(e.features));
 *     map.on('draw.delete', (e) => onDrawDelete?.(e.features));
 *
 *     return () => {
 *       map.removeControl(drawControl);
 *     };
 *   }, [map, isLoaded]);
 *
 *   return null;
 * }
 * ```
 *
 * ========================================
 * USAGE EXAMPLE WITH terra-draw:
 * ========================================
 *
 * ```tsx
 * import { TerraDraw, TerraDrawMapLibreGLAdapter } from 'terra-draw';
 *
 * function DrawControl({ onDrawComplete }) {
 *   const { map, isLoaded } = useMap();
 *
 *   useEffect(() => {
 *     if (!map || !isLoaded) return;
 *
 *     const draw = new TerraDraw({
 *       adapter: new TerraDrawMapLibreGLAdapter({ map }),
 *       modes: [
 *         new TerraDrawPolygonMode(),
 *         new TerraDrawRectangleMode(),
 *         new TerraDrawCircleMode(),
 *       ],
 *     });
 *
 *     draw.start();
 *
 *     draw.on('finish', (id) => {
 *       const snapshot = draw.getSnapshot();
 *       onDrawComplete?.(snapshot);
 *     });
 *
 *     return () => {
 *       draw.stop();
 *     };
 *   }, [map, isLoaded]);
 *
 *   return null;
 * }
 * ```
 */

// Types for draw events
export interface DrawnFeature {
  type: "Feature";
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: Record<string, unknown>;
}

export type DrawMode = "polygon" | "rectangle" | "circle" | "freehand" | "none";

interface DrawControlProps {
  /** Callback when a shape is drawn */
  onDrawCreate?: (features: DrawnFeature[]) => void;
  /** Callback when a shape is deleted */
  onDrawDelete?: (features: DrawnFeature[]) => void;
  /** Callback when drawing mode changes */
  onModeChange?: (mode: DrawMode) => void;
  /** Initial mode */
  defaultMode?: DrawMode;
  /** Position of the control */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * DrawControl - Placeholder component for drawing functionality
 *
 * TODO: Implement with one of the libraries above after installation
 *
 * For now, this is a UI placeholder showing the intended controls
 */
export function DrawControl({
  onDrawCreate,
  onDrawDelete,
  onModeChange,
  defaultMode = "none",
  position = "top-left",
}: DrawControlProps) {
  const { map, isLoaded } = useMap();
  const [activeMode, setActiveMode] = useState<DrawMode>(defaultMode);

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const handleModeChange = useCallback(
    (mode: DrawMode) => {
      setActiveMode(mode === activeMode ? "none" : mode);
      onModeChange?.(mode === activeMode ? "none" : mode);
    },
    [activeMode, onModeChange]
  );

  const handleClear = useCallback(() => {
    // TODO: Implement clear functionality
    console.log("Clear drawing - implement with chosen library");
    onDrawDelete?.([]);
  }, [onDrawDelete]);

  // This is a placeholder UI - actual drawing logic needs library integration
  return (
    <div
      className={`absolute ${positionClasses[position]} z-10 bg-background/90 backdrop-blur rounded-lg shadow-lg border overflow-hidden`}
    >
      <div className="flex">
        <Button
          variant={activeMode === "polygon" ? "default" : "ghost"}
          size="sm"
          className="rounded-none h-9 px-3"
          onClick={() => handleModeChange("polygon")}
          title="Draw polygon"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant={activeMode === "rectangle" ? "default" : "ghost"}
          size="sm"
          className="rounded-none h-9 px-3"
          onClick={() => handleModeChange("rectangle")}
          title="Draw rectangle"
        >
          <Square className="size-4" />
        </Button>
        <Button
          variant={activeMode === "circle" ? "default" : "ghost"}
          size="sm"
          className="rounded-none h-9 px-3"
          onClick={() => handleModeChange("circle")}
          title="Draw circle"
        >
          <Circle className="size-4" />
        </Button>
        <div className="w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none h-9 px-3 text-destructive hover:text-destructive"
          onClick={handleClear}
          title="Clear drawing"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
