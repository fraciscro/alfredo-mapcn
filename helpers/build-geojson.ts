import polyline from "@mapbox/polyline";

export function formatPrice(price: number): string {
  if (price < 1000) return String(price);
  if (price < 1000000) return `${(price / 1000).toFixed(0)}k`;
  return `${(price / 1000000).toFixed(1)}M`;
}

export const buildGeometryGeoJSON = (
  geometry: Array<{ type: "Polygon" | "MultiPolygon"; polyline: string[] }>
): GeoJSON.FeatureCollection => {
  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  geometry.forEach((entry) => {
    if (entry.type === "Polygon") {
      // Decodifica o polyline (formato comprimido de coordenadas)
      // O polyline usa [lat, lng], mas GeoJSON precisa [lng, lat], por isso fazemos reverse
      const polylineString = entry.polyline[0];
      if (!polylineString) return;

      const coordinatesDecoded = polyline.decode(polylineString, 6);
      const coordinates = [
        coordinatesDecoded.map((coords) => [coords[1], coords[0]]), // [lng, lat]
      ];

      geojson.features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: coordinates,
        },
        properties: {},
      });
    } else if (entry.type === "MultiPolygon") {
      // Para MultiPolygon, pode haver múltiplos polígonos
      const coordinatesDecoded = entry.polyline.map((poly) => polyline.decode(poly, 6));
      const coordinates = coordinatesDecoded.map((polygon) => [
        polygon.map((coords) => [coords[1], coords[0]]), // [lng, lat]
      ]);

      geojson.features.push({
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: coordinates,
        },
        properties: {},
      });
    }
  });

  return geojson;
};

export const buildDensityGeoJSON = (points: number[][]): GeoJSON.FeatureCollection => {
  return {
    type: "FeatureCollection",
    features: points
      .filter((element) => typeof element[0] === "number" && typeof element[1] === "number")
      .map((point) => {
        const lng = point[0]!;
        const lat = point[1]!;
        const id = point[2];
        const price = point[3];

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [lng, lat] as [number, number],
          },
          properties: {
            id: String(id || ""),
            price: price && price >= 100 ? formatPrice(price) : "",
          },
        };
      }),
  };
};
