"use client";

import { Map, MapControls, MapClusterLayer, MapPopup } from "@/components/ui/map";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useState } from "react";

// Import organized map components
import {
  GeometryLayer,
  FitBounds,
  PropertyPopupContent,
  fetchPropertyDetails,
  ControlBoard,
  DrawControl,
  type DrawnFeature,
} from "@/components/map";

interface PropertyPoint {
  id: string;
  price: string;
}

type MyMapProps = {
  density?: GeoJSON.FeatureCollection | null;
  geometry?: GeoJSON.FeatureCollection | null;
  loading?: boolean;
  onPolygonCreate?: (coordinates: number[][][]) => void;
  onReset?: () => void;
  hasCustomPolygon?: boolean;
};

export function MyMap({
  density,
  geometry,
  loading,
  onPolygonCreate,
  onReset,
  hasCustomPolygon,
}: MyMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<{
    coordinates: [number, number];
    properties: PropertyPoint;
  } | null>(null);

  // Fetch property details when a point is selected
  const {
    data: propertyDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery({
    queryKey: ["property", selectedPoint?.properties.id],
    queryFn: () => fetchPropertyDetails(selectedPoint!.properties.id),
    enabled: !!selectedPoint?.properties.id,
    staleTime: 5 * 60 * 1000,
  });

  // Handle polygon creation from draw control
  const handleDrawCreate = (features: DrawnFeature[]) => {
    const geometry = features[0]?.geometry;
    if (geometry && geometry.type === "Polygon") {
      const coordinates = geometry.coordinates as number[][][];
      console.log("📍 Polygon coordinates:", coordinates);
      onPolygonCreate?.(coordinates);
    }
  };

  return (
    <Card className="h-[500px] p-0 overflow-hidden relative">
      {/* Loading overlay */}
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

        {/* Property popup */}
        {selectedPoint && (
          <MapPopup
            key={`${selectedPoint.coordinates[0]}-${selectedPoint.coordinates[1]}`}
            longitude={selectedPoint.coordinates[0]}
            latitude={selectedPoint.coordinates[1]}
            onClose={() => setSelectedPoint(null)}
            closeOnClick={true}
            focusAfterOpen={false}
          >
            <PropertyPopupContent
              isLoading={isLoadingDetails}
              error={detailsError}
              property={propertyDetails}
              fallbackPrice={selectedPoint.properties.price}
            />
          </MapPopup>
        )}

        {/* Auto fit bounds to data */}
        <FitBounds density={density} geometry={geometry} />

        {/* Draw control */}
        <DrawControl position="top-left" onDrawCreate={handleDrawCreate} />

        {/* Navigation controls - simplified to just reset button */}
        <ControlBoard onReset={onReset} hasCustomPolygon={hasCustomPolygon} />

        <MapControls />
      </Map>
    </Card>
  );
}
