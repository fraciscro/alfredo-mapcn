"use client";

import { Map, MapControls, MapClusterLayer, MapPopup, useMap } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as turf from "@turf/turf";
import { ExternalLink, Loader2 } from "lucide-react";

// Locations for the control board
const LOCATIONS = [
  { name: "O Pinto", coordinates: [-8.4563, 41.1496] as [number, number], zoom: 15 },
  { name: "Entroncamento", coordinates: [-8.4679, 39.4635] as [number, number], zoom: 12 },
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

// Fetch property details from the API
async function fetchPropertyDetails(platformHash: string) {
  const response = await fetch(`/api/metasearch-property?platform_hash=${platformHash}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch property details");
  }

  return response.json();
}

export function MyMap({ density, geometry, loading }: MyMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<{
    coordinates: [number, number];
    properties: PropertyPoint;
  } | null>(null);

  // Fetch property details when a point is selected
  // The query only runs when selectedPoint exists (enabled: !!selectedPoint)
  const {
    data: propertyDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery({
    queryKey: ["property", selectedPoint?.properties.id],
    queryFn: () => fetchPropertyDetails(selectedPoint!.properties.id),
    enabled: !!selectedPoint?.properties.id, // Only fetch when we have a selected point
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

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
            <PropertyPopupContent
              isLoading={isLoadingDetails}
              error={detailsError}
              property={propertyDetails}
              fallbackPrice={selectedPoint.properties.price}
            />
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

// Type for property details from the API
interface PropertyDetails {
  images?: string[];
  image?: string;
  title?: string;
  address?: string;
  price?: string;
  url?: string;
  link?: string;
  asset_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

// Separate component for popup content - handles loading, error, and success states
function PropertyPopupContent({
  isLoading,
  error,
  property,
  fallbackPrice,
}: {
  isLoading: boolean;
  error: Error | null;
  property: PropertyDetails | undefined;
  fallbackPrice: string;
}) {
  // Loading state
  if (isLoading) {
    return (
      <div className="w-64 p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-64 p-4">
        <p className="text-sm text-destructive">Failed to load property details</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  // Success state - display property details
  const imageUrl = property?.images?.[0] || property?.image;
  const title = property?.title || property?.address || "Property";
  const price = property?.price || fallbackPrice;
  const url = property?.url || property?.link;

  return (
    <div className="w-64">
      {/* Property Image */}
      {imageUrl && (
        <div className="relative h-32 overflow-hidden rounded-md">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Property Details */}
      <div className="space-y-2 pt-2">
        <div>
          {property?.asset_type && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {property.asset_type}
            </span>
          )}
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2">{title}</h3>
        </div>

        {/* Price */}
        {price && <p className="text-lg font-bold text-primary">{price}</p>}

        {/* Property features */}
        <div className="flex gap-3 text-xs text-muted-foreground">
          {property?.bedrooms && <span>{property.bedrooms} beds</span>}
          {property?.bathrooms && <span>{property.bathrooms} baths</span>}
          {property?.area && <span>{property.area} m²</span>}
        </div>

        {/* Actions */}
        {url && (
          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8"
              onClick={() => window.open(url, "_blank")}
            >
              <ExternalLink className="size-3.5 mr-1.5" />
              View Listing
            </Button>
          </div>
        )}
      </div>
    </div>
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
