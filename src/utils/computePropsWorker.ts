// import { dataIndex } from "./addData";
import osmtogeojson from "osmtogeojson";
import { calculatePropsFromGeo } from "./calculateFromGeo";
import { osmRel } from "../types";
import { Feature, GeoJsonProperties, Geometry } from "geojson";

self.onmessage = (e) => {
  const osmRels = e.data;

  const newDataRels = addComputedProps(osmRels);

  self.postMessage(newDataRels);
};

function addComputedProps(osmRels: osmRel[]) {
  // batch osmtogeojson conversion
  const geoJSON = osmtogeojson({ elements: osmRels });

  const featureMap = new Map();
  geoJSON.features.forEach((f: Feature<Geometry, GeoJsonProperties>) => {
    const id = f.id!.toString();
    if (!id.includes("relation/")) return;
    featureMap.set(f.id!.toString().replace("relation/", ""), f);
  });

  return osmRels.map((rel) => {
    // rel props
    const id = rel.id.toString();
    const relProps = {
      id,
      admin_level: rel.tags.admin_level,
      name: rel.tags["name:en"] ?? rel.tags["alt_name:en"] ?? rel.tags["name"],
      population: rel.tags?.population ? parseInt(rel.tags.population) : null,
    };

    // geo computed props
    const feature = featureMap.get(rel.id.toString());
    let calcProps: { area: number | null; perimeter: number | null } = {
      area: null,
      perimeter: null,
    };
    // some relations are malformed so they wont have a geojson
    if (feature) {
      calcProps = calculatePropsFromGeo(feature);
    }

    // derived props
    let popDensity = null;
    if (calcProps.area && rel.tags?.population) {
      popDensity = rel.tags.population / calcProps.area;
    }
    const derivedProps = {
      popDensity,
    };

    const allProps = { ...relProps, ...calcProps, ...derivedProps };

    // simulate delay
    // const start = Date.now();
    // while (Date.now() - start < 2000) { }

    return allProps;
  });
}
