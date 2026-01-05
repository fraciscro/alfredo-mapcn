import { useQuery } from "@tanstack/react-query";
import { Header } from "./header";
import { MyMap } from "./my-map";
import { buildDensityGeoJSON, buildGeometryGeoJSON } from "@/helpers/build-geojson";

const getDensityData = async () => {
  const response = await fetch(
    `/api/prospect/density?address_names=Entroncamento&addresses=1410&layout=map-only&country=pt&ad_type=sell`,
    { cache: "no-store" }
  );

  const data = await response.json();

  // Process data into GeoJSON
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
  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["density"],
    queryFn: getDensityData,
  });

  const densityData = data?.density ?? null;
  const geometry = data?.geometry ?? null;

  console.log("densityData", densityData);
  console.log("geometry", geometry);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <MyMap />
        </div>
      </main>
    </div>
  );
};

export default HomeComponent;
