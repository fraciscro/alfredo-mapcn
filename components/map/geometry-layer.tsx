"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";
import type maplibregl from "maplibre-gl";

interface GeometryLayerProps {
  geometry: GeoJSON.FeatureCollection;
  fillColor?: string;
  fillOpacity?: number;
  lineColor?: string;
  lineWidth?: number;
}

/**
 * GeometryLayer - Displays a polygon/multipolygon on the map
 * Used to show search areas, boundaries, or any geographic region
 */
export function GeometryLayer({
  geometry,
  fillColor = "#009de0",
  fillOpacity = 0.1,
  lineColor = "#009de0",
  lineWidth = 2,
}: GeometryLayerProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Add source if it doesn't exist
    if (!map.getSource("geometry-source")) {
      map.addSource("geometry-source", {
        type: "geojson",
        data: geometry,
      });
    } else {
      // Update existing source
      const source = map.getSource("geometry-source") as maplibregl.GeoJSONSource;
      source.setData(geometry);
    }

    // Add fill layer if it doesn't exist
    if (!map.getLayer("geometry-fill")) {
      map.addLayer({
        id: "geometry-fill",
        type: "fill",
        source: "geometry-source",
        paint: {
          "fill-color": fillColor,
          "fill-opacity": fillOpacity,
        },
      });
    }

    // Add outline layer if it doesn't exist
    if (!map.getLayer("geometry-outline")) {
      map.addLayer({
        id: "geometry-outline",
        type: "line",
        source: "geometry-source",
        paint: {
          "line-color": lineColor,
          "line-width": lineWidth,
        },
      });
    }

    return () => {
      // Cleanup on unmount - check if map still exists
      try {
        if (map.getLayer("geometry-outline")) map.removeLayer("geometry-outline");
        if (map.getLayer("geometry-fill")) map.removeLayer("geometry-fill");
        if (map.getSource("geometry-source")) map.removeSource("geometry-source");
      } catch {
        // Map was already destroyed, ignore cleanup
      }
    };
  }, [map, isLoaded, geometry, fillColor, fillOpacity, lineColor, lineWidth]);

  return null;
}

