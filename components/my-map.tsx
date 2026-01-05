"use client";

import { Map, MapControls, MapClusterLayer, MapPopup, useMap } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import * as turf from "@turf/turf";

// Locations for the control board
const LOCATIONS = [
  { name: "Esposende", coordinates: [-8.7811, 41.5336] as [number, number], zoom: 12 },
  { name: "Restaurante Pinto", coordinates: [-8.4563, 41.1496] as [number, number], zoom: 15 },
  { name: "Entroncamento", coordinates: [-8.4679, 39.4635] as [number, number], zoom: 12 },
  { name: "Lisboa", coordinates: [-9.1393, 38.7223] as [number, number], zoom: 11 },
  { name: "Porto", coordinates: [-8.6291, 41.1579] as [number, number], zoom: 11 },
];

interface PropertyPoint {
  id: string;
  price: string;
}

type MyMapProps = {
  density?: GeoJSON.FeatureCollection | null;
  geometry?: GeoJSON.FeatureCollection | null;
  loading?: boolean;
};

// Geometry layer component for displaying the search area polygon
function GeometryLayer({ geometry }: { geometry: GeoJSON.FeatureCollection }) {
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
          "fill-color": "#009de0",
          "fill-opacity": 0.1,
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
          "line-color": "#009de0",
          "line-width": 2,
        },
      });
    }

    return () => {
      // Cleanup on unmount
      if (map.getLayer("geometry-outline")) map.removeLayer("geometry-outline");
      if (map.getLayer("geometry-fill")) map.removeLayer("geometry-fill");
      if (map.getSource("geometry-source")) map.removeSource("geometry-source");
    };
  }, [map, isLoaded, geometry]);

  return null;
}

// FitBounds component that fits the map to show all data
function FitBounds({
  density,
  geometry,
}: {
  density?: GeoJSON.FeatureCollection | null;
  geometry?: GeoJSON.FeatureCollection | null;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Use geometry for bounds (the search area), fallback to density
    const dataToFit = geometry || density;
    if (!dataToFit || dataToFit.features.length === 0) return;

    try {
      const bbox = turf.bbox(dataToFit);
      if (bbox[0] === Infinity) return;

      // Small delay to ensure layers are rendered
      setTimeout(() => {
        map.fitBounds(bbox as [number, number, number, number], {
          padding: 50,
          duration: 1000,
        });
      }, 100);
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [map, isLoaded, density, geometry]);

  return null;
}

export function MyMap({ density, geometry, loading }: MyMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<{
    coordinates: [number, number];
    properties: PropertyPoint;
  } | null>(null);

  return (
    <Card className="h-[500px] p-0 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-lg">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium">Loading map data...</span>
          </div>
        </div>
      )}

      <Map center={[-8.22, 39.39]} zoom={6}>
        {/* Geometry layer (polygon area) */}
        {geometry && geometry.features.length > 0 && <GeometryLayer geometry={geometry} />}

        {/* Clusters layer */}
        {density && density.features.length > 0 && (
          <MapClusterLayer<PropertyPoint>
            data={density as GeoJSON.FeatureCollection<GeoJSON.Point, PropertyPoint>}
            clusterRadius={50}
            clusterMaxZoom={20}
            // Alfredo-neo style colors: dark circles that turn gold at high zoom
            clusterColors={["#191C1F", "#191C1F", "#EBCB8B"]}
            clusterThresholds={[100, 750]}
            pointColor="#EBCB8B"
            onPointClick={(feature, coordinates) => {
              setSelectedPoint({
                coordinates,
                properties: feature.properties,
              });
            }}
          />
        )}

        {/* Popup for selected point */}
        {selectedPoint && (
          <MapPopup
            key={`${selectedPoint.coordinates[0]}-${selectedPoint.coordinates[1]}`}
            longitude={selectedPoint.coordinates[0]}
            latitude={selectedPoint.coordinates[1]}
            onClose={() => setSelectedPoint(null)}
            closeOnClick={false}
            focusAfterOpen={false}
            closeButton
          >
            <div className="space-y-1 p-1">
              <p className="text-sm font-medium">ID: {selectedPoint.properties.id}</p>
              {selectedPoint.properties.price && (
                <p className="text-sm text-muted-foreground">
                  Price: {selectedPoint.properties.price}
                </p>
              )}
            </div>
          </MapPopup>
        )}

        {/* FitBounds - automatically fits to show all data */}
        <FitBounds density={density} geometry={geometry} />

        {/* Control Board - INSIDE the Map context */}
        <ControlBoard />

        <MapControls />
      </Map>
    </Card>
  );
}

// Control board component that lives inside the Map context
function ControlBoard() {
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
    <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg border">
      <h3 className="text-xs font-medium mb-2 text-muted-foreground">Fly to</h3>
      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
        {LOCATIONS.map((location) => (
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
