import { area } from "@turf/area";
import { length } from "@turf/length";
import { Feature, GeoJsonProperties, Geometry } from "geojson";

function calculatePropsFromGeo(geo: Feature<Geometry, GeoJsonProperties>): {
  area: number | null;
  perimeter: number | null;
} {
  return {
    area: area(geo) / 1_000_000, // (km)^2
    perimeter: length(geo), // km,
  };
}

export { calculatePropsFromGeo };
