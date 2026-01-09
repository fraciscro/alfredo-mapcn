"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";
import * as turf from "@turf/turf";

interface FitBoundsProps {
  density?: GeoJSON.FeatureCollection | null;
  geometry?: GeoJSON.FeatureCollection | null;
  padding?: number;
  duration?: number;
}

/**
 * FitBounds - Automatically fits the map view to show all data
 * Prioritizes geometry (search area) over density (points)
 */
export function FitBounds({ density, geometry, padding = 50, duration = 1000 }: FitBoundsProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Use geometry for bounds (the search area), fallback to density
    const dataToFit = geometry || density;
    if (!dataToFit || dataToFit.features.length === 0) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    try {
      const bbox = turf.bbox(dataToFit);
      if (bbox[0] === Infinity) return;

      // Small delay to ensure layers are rendered
      timeoutId = setTimeout(() => {
        try {
          map.fitBounds(bbox as [number, number, number, number], {
            padding,
            duration,
          });
        } catch {
          // Map was destroyed, ignore
        }
      }, 100);
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [map, isLoaded, density, geometry, padding, duration]);

  return null;
}
