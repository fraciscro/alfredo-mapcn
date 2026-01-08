import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./header";
import { MyMap } from "./my-map";
import { buildDensityGeoJSON, buildGeometryGeoJSON } from "@/helpers/build-geojson";

// Default request parameters
const DEFAULT_PARAMS = {
  address_names: "Entroncamento",
  addresses: "1410",
  country: "pt",
  ad_type: "sell",
};

const getDensityData = async (polygon: number[][][] | null) => {
  // Build the URL with params
  const params = new URLSearchParams();

  if (polygon) {
    // When we have a polygon, use it instead of addresses
    params.set("country", DEFAULT_PARAMS.country);
    params.set("ad_type", DEFAULT_PARAMS.ad_type);
    // Polygon is already [[[lng, lat], ...]] from MapLibre Draw - don't wrap it again!
    params.set("polygon", JSON.stringify(polygon));
    console.log("POLYGON STRINGIFIED:", JSON.stringify(polygon));
  } else {
    // Default: use addresses
    params.set("address_names", DEFAULT_PARAMS.address_names);
    params.set("addresses", DEFAULT_PARAMS.addresses);
    params.set("country", DEFAULT_PARAMS.country);
    params.set("ad_type", DEFAULT_PARAMS.ad_type);
  }

  const url = `/api/prospect/density?${params.toString()}`;
  console.log("PARAMS:", params.toString());
  console.log("📍 Fetching:", url);

  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  let densityGeoJSON: GeoJSON.FeatureCollection | null = null;
  let geometryGeoJSON: GeoJSON.FeatureCollection | null = null;

  if (data.data?.length > 0) {
    const filteredPoints = data.data.map((item: number[]) => {
      const point = [...item];
      if (point[3] !== undefined && typeof point[3] === "number" && point[3] < 100) {
        point[3] = 0;
      }
      return point;
    });
    densityGeoJSON = buildDensityGeoJSON(filteredPoints);
  }

  if (data.geometry?.length > 0) {
    geometryGeoJSON = buildGeometryGeoJSON(data.geometry);
  }

  return {
    density: densityGeoJSON,
    geometry: geometryGeoJSON,
    total: data.total,
  };
};

const HomeComponent = () => {
  // State for the drawn polygon
  const [drawnPolygon, setDrawnPolygon] = useState<number[][][] | null>(null);

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["density", drawnPolygon], // Include polygon in query key to refetch when it changes
    queryFn: () => getDensityData(drawnPolygon),
  });

  const densityData = data?.density ?? null;
  const geometry = data?.geometry ?? null;
  const loading = isLoading || isRefetching;

  // Handler when polygon is drawn
  const handlePolygonCreate = (coordinates: number[][][]) => {
    console.log("🗺️ New polygon drawn, updating search...");
    setDrawnPolygon(coordinates);
  };

  // Handler to reset to default (Entroncamento)
  const handleReset = () => {
    console.log("🔄 Resetting to default location...");
    setDrawnPolygon(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <MyMap
            density={densityData}
            geometry={geometry}
            loading={loading}
            onPolygonCreate={handlePolygonCreate}
            onReset={handleReset}
            hasCustomPolygon={drawnPolygon !== null}
          />
        </div>
      </main>
    </div>
  );
};

export default HomeComponent;
