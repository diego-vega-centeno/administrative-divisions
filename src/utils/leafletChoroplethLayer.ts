import { Feature, FeatureCollection, GeometryObject } from "geojson";
import styles from "../styles/Main.module.css";
import { LeafletStateRefProps } from "../types";
import { LeafletMouseEvent } from "leaflet";

function createChoroplethLayer(
  L: typeof import("leaflet"),
  leafletState: LeafletStateRefProps,
  geojson: FeatureCollection<GeometryObject>,
  colorMap: Map<string, string>,
  computedPropsMap: Map<string, any>,
  colors: string[],
  ranges: Array<[number, number]>,
  legendTitle: string,
) {
  //* legend control
  if (leafletState.legendControl) leafletState.legendControl.remove();

  leafletState.legendControl = new L.Control({ position: "bottomright" });

  leafletState.legendControl.onAdd = function (map) {
    const div = L.DomUtil.create(
      "div",
      `${styles["info"]} ${styles["legend"]}`,
    );
    const grades = ranges.map((range) => range[0]).reverse();
    div.innerHTML = `<div style="text-align: center; font-weight:bold">${legendTitle}</div>`;
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(grades[i] + 1, ranges, colors) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    (leafletState.legendControl! as any).div = div;
    return div;
  };

  leafletState.legendControl.addTo(leafletState.map!);

  //* info panel
  if (leafletState.choroplethInfoPanel)
    leafletState.choroplethInfoPanel.remove();
  leafletState.choroplethInfoPanel = new L.Control({ position: "topright" });

  leafletState.choroplethInfoPanel!.onAdd = function (map) {
    const div = L.DomUtil.create("div", styles["info"]);
    (leafletState.choroplethInfoPanel! as any).div = div;
    updateChoroplethInfoPanel(leafletState);
    return div;
  };

  leafletState.choroplethInfoPanel.addTo(leafletState.map!);

  //* create geojson layer
  const geoJsonLayer = L.geoJSON(geojson, {
    filter: (feature) => feature.geometry.type !== "Point",
    // custom tooltip
    // onEachFeature: (feature, layer) => onEachFeature(feature, layer, leafletState),
    style: (feature) =>
      style(feature as Feature<GeometryObject, any>, colorMap),
    onEachFeature: (feature, layer) => {
      (layer as any)._geoJsonParentTitle = legendTitle;
      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          if (!e.target || !e.target._map) return;
          highlightFeature(e, leafletState, legendTitle, computedPropsMap);
        },
        mouseout: (e) => {
          if (!e.target || !e.target._map) return;
          geoJsonLayer.resetStyle(e.target)
        },
      });
    },
  });

  return geoJsonLayer;
}

function highlightFeature(
  e: LeafletMouseEvent,
  leafletState: LeafletStateRefProps,
  legendTitle: string,
  computedPropsMap: Record<string, any>,
) {
  const layer = e.target;
  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });

  layer.bringToFront();

  const featureProps = computedPropsMap.get(layer.feature.id);
  let val = null;
  let unit = "";
  switch (legendTitle) {
    case "Population":
      val = Math.round(featureProps.population);
      unit = "person";
      break;
    case "Population density":
      val = featureProps.popDensity.toFixed(2);
      unit = "(person/km²)";
      break;
    case "Area":
      val = featureProps.area.toFixed(2);
      unit = "(km²)";
      break;
    default:
      break;
  }

  if (!val) {
    val = "---";
    unit = "";
  }

  updateChoroplethInfoPanel(
    leafletState,
    legendTitle,
    featureProps.name,
    val,
    unit,
  );
}

//* utility functions

function generateHueColors(num: number) {
  const start = 40;
  const end = 200;
  const colors = [];
  for (let i = 0; i < num; i++) {
    const t = i / (num - 1);
    const hue = Math.round(start + t * (end - start));
    colors.push(`hsl(${hue}, 100%, 25%)`);
  }
  return colors;
}

function getChoroplethRanges(
  values: number[],
  num: number,
): Array<[number, number]> {
  let divisionsNum = num;
  if (values.length < num) {
    divisionsNum = values.length;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / divisionsNum;

  const ranges: Array<[number, number]> = [];
  let start = Math.floor(min);
  for (let i = 0; i < divisionsNum; i++) {
    let end =
      i === divisionsNum - 1
        ? Math.ceil(max)
        : Math.floor(min + (i + 1) * step);
    ranges.push([start, end]);
    start = end + 1;
  }

  return ranges;
}

function getColor(
  val: number,
  ranges: Array<[number, number]>,
  colors: string[],
) {
  // const colors = ['#FED976', '#FDD06D', '#FCC464', '#FBAC52', '#FA843F', '#F95B2D', '#E9341D', '#D50027', '#A00025', '#800026'];
  // const colors = ['#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

  for (let i = 0; i < ranges.length; i++) {
    if (i === ranges.length - 1) return colors[i];
    if (val >= ranges[i][0] && val < ranges[i][1]) {
      return colors[i];
    }
  }

  return "#ccc";
}

function style(
  feature: Feature<GeometryObject, any>,
  colorMap: Record<string, any>,
) {
  return {
    fillColor: colorMap.get(feature.id) ?? "#ccc",
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

function updateLegend(
  L: typeof import("leaflet"),
  leafletState: LeafletStateRefProps,
  colorMap: Map<string, string>,
  computedPropsMap: Map<string, any>,
  colors: string[],
  ranges: Array<[number, number]>,
  legendTitle: string,
) {
  const div = (leafletState.legendControl! as any).div;

  const grades = ranges.map((range) => range[0]).reverse();
  div.innerHTML = `<div style="text-align: center; font-weight:bold">${legendTitle}</div>`;
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      getColor(grades[i] + 1, ranges, colors) +
      '"></i> ' +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }
}

function updateChoroplethInfoPanel(
  leafletState: LeafletStateRefProps,
  legendTitle?: string,
  name?: string,
  val?: number,
  unit?: string,
) {
  (leafletState.choroplethInfoPanel! as any).div.innerHTML = val
    ? `<h4>${legendTitle}</h4>` + "<b>" + name + "</b><br />" + val + ` ${unit}`
    : "Hover over a state";
}

export {
  createChoroplethLayer,
  getChoroplethRanges,
  getColor,
  generateHueColors,
  updateLegend,
  updateChoroplethInfoPanel,
};
