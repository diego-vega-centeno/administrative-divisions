// import { dataIndex } from "./addData";
// import { getParentNames } from "./addData";
import osmtogeojson from "osmtogeojson";
import { calculatePropsFromGeo } from "./calculateFromGeo";

self.onmessage = (e) => {
  const osmRels = e.data;

  const newDataRels = addComputedProps(osmRels);

  self.postMessage(newDataRels);
};


function addComputedProps(osmRels) {

  // batch osmtogeojson conversion
  const geoJSON = osmtogeojson({ elements: osmRels });

  const featureMap = new Map();
  geoJSON.features.forEach(f => {
    featureMap.set(f.id.toString().replace('relation/', ''), f);
  });

  return osmRels.map(rel => {

    // rel props
    const id = rel.id.toString();
    const relProps = {
      id,
      admin_level: rel.tags.admin_level,
      name: rel.tags['name:en'] ?? rel.tags['alt_name:en'] ?? rel.tags['name'],
      population: rel.tags?.population ? parseInt(rel.tags.population) : null
    };

    // geo computed props
    const feature = featureMap.get(rel.id.toString());
    const calcProps = calculatePropsFromGeo(feature);

    // derived props
    const derivedProps = {
      popDensity: rel.tags?.population ?
        rel.tags?.population / calcProps.area :
        null
    }

    const allProps = { ...relProps, ...calcProps, ...derivedProps };

    // simulate delay
    // const start = Date.now();
    // while (Date.now() - start < 2000) { }

    return allProps;
  })
}