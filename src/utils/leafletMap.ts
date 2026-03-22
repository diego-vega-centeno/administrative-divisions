import osmtogeojson from "osmtogeojson";
import L, { Control } from "leaflet";
import {
  createChoroplethLayer,
  getChoroplethRanges,
  getColor,
  generateHueColors,
  updateLegend,
} from "./leafletChoroplethLayer";
import { onEachFeature } from "./leafletUtilities";
import { ComputedDataRelType, LeafletStateRefProps, osmRel } from "../types";
import { FeatureCollection, GeometryObject } from "geojson";

/* main leaflet map creation */

function addToLeafletMap(
  osmRels: osmRel[],
  computedDataRels: ComputedDataRelType[],
  leafletState: LeafletStateRefProps,
) {
  // clear highlighted
  leafletState.highlightedLayer = null;

  //* remove previous layers except tile layers
  // remove references from layer control
  if (leafletState.layerControl) {
    if (leafletState.baseLayer)
      leafletState.layerControl.removeLayer(leafletState.baseLayer);
    if (leafletState.popDensityLayer)
      leafletState.layerControl.removeLayer(leafletState.popDensityLayer);
  }
  // remove references from map
  if (leafletState.baseLayer) {
    leafletState.baseLayer.off();
    leafletState.map!.removeLayer(leafletState.baseLayer);
  }

  if (leafletState.popDensityLayer){
    leafletState.popDensityLayer.off();
    leafletState.map!.removeLayer(leafletState.popDensityLayer);
  }

  //* base tile layer
  if (!leafletState.tileLayer) {
    // save tile layer of leaflet state
    leafletState.tileLayer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 15,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    ).addTo(leafletState.map!);
  }

  //* conver to geojson
  const geojson = osmtogeojson({ elements: osmRels });

  if (leafletState.type === "base") {
    //* base layer
    leafletState.baseLayer = L.geoJSON(geojson, {
      filter: (feature) => feature.geometry.type !== "Point",
      // custom tooltip
      onEachFeature: (feature, layer) =>
        onEachFeature(feature, layer, leafletState),
    });

    //* add layers
    leafletState.map!.fitBounds(leafletState.baseLayer.getBounds());
    leafletState.baseLayer.addTo(leafletState.map!);

    //* check if tags control panel was added, if not add it
    if (!leafletState.mapControl!._map) {
      leafletState.mapControl!.addTo(leafletState.map!);
    }
    // clear body content of tags control
    leafletState.mapControl!.updateTagsPanel(leafletState, {}, "none");

    leafletState.map!.off("click", leafletState.handleMapClick);
    leafletState.map!.on("click", leafletState.handleMapClick);
  }
  //* add buttons
  if (!(leafletState.centerBtn! as any)._map) {
    leafletState.centerBtn!.addTo(leafletState.map!);
  }

  if (leafletState.type === "choropleth") {
    addChoroplethLayer(computedDataRels, geojson, L, leafletState);
  }
}

//* compute ranges and colors
function getChoroplethParams(
  computedDataRels: ComputedDataRelType[],
  prop: keyof Pick<ComputedDataRelType, "area" | "popDensity" | "population">,
): [Map<string, string>, Map<string, any>, string[], Array<[number, number]>] {
  const values = getValues(computedDataRels, prop);
  const ranges = getChoroplethRanges(values, 7);
  const colors = generateHueColors(7);

  const colorMap = new Map();
  const computedPropsMap = new Map();
  computedDataRels.forEach((rel) => {
    const val = rel[prop];
    colorMap.set("relation/" + rel.id, getColor(val, ranges, colors));
    computedPropsMap.set("relation/" + rel.id, rel);
  });
  return [colorMap, computedPropsMap, colors, ranges];
}

function getValues(
  computedDataRels: ComputedDataRelType[],
  prop: keyof Pick<ComputedDataRelType, "area" | "popDensity" | "population">,
) {
  return computedDataRels.reduce((acc: number[], rel) => {
    const val = parseInt(String(rel[prop]));
    if (!isNaN(val)) acc.push(val);
    return acc;
  }, []);
}

function addChoroplethLayer(
  computedDataRels: ComputedDataRelType[],
  geojson: FeatureCollection<GeometryObject>,
  L: typeof import("leaflet"),
  leafletState: LeafletStateRefProps,
) {
  type SpreadParams = [
    Map<string, string>,
    Map<string, any>,
    string[],
    Array<[number, number]>,
  ];

  //* Choropleth layers
  const popDensityParams: SpreadParams = getChoroplethParams(
    computedDataRels,
    "popDensity",
  );

  leafletState.popDensityLayer = createChoroplethLayer(
    L,
    leafletState,
    geojson,
    ...popDensityParams,
    "Population density",
  );

  const areaParams = getChoroplethParams(computedDataRels, "area");
  leafletState.areaLayer = createChoroplethLayer(
    L,
    leafletState,
    geojson,
    ...areaParams,
    "Area",
  );
  // population is the base layer
  const popParams: SpreadParams = getChoroplethParams(
    computedDataRels,
    "population",
  );
  leafletState.baseLayer = createChoroplethLayer(
    L,
    leafletState,
    geojson,
    ...popParams,
    "Population",
  );

  leafletState.map!.fitBounds(leafletState.baseLayer!.getBounds());

  leafletState.baseLayer!.addTo(leafletState.map!);

  //* add control layers
  leafletState.layerControl = L.control
    .layers(
      {
        Population: leafletState.baseLayer,
        "Population density": leafletState.popDensityLayer,
        Area: leafletState.areaLayer,
      } as Control.LayersObject,
      undefined,
      { position: "topleft" },
    )
    .addTo(leafletState.map!);

  //* Add layer switching event listener
  leafletState.map!.on("baselayerchange", function (e) {
    // Update legend when layer is switched
    switch ((e.layer as any)._leaflet_id) {
      case (leafletState.baseLayer! as any)._leaflet_id:
        updateLegend(L, leafletState, ...popParams, "Population");
        break;
      case (leafletState.popDensityLayer! as any)._leaflet_id:
        updateLegend(
          L,
          leafletState,
          ...popDensityParams,
          "Population density",
        );
        break;
      case (leafletState.areaLayer! as any)._leaflet_id:
        updateLegend(L, leafletState, ...areaParams, "Area");
        break;

      default:
        break;
    }
  });
}

export { addToLeafletMap };
