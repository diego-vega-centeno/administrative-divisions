import osmtogeojson from 'osmtogeojson';
import L from 'leaflet';
import {
  createChoroplethLayer,
  getChoroplethRanges, getColor, generateHueColors
} from './leafletChoroplethLayer';
import { onEachFeature } from './leafletUtilities';

/* main leaflet map creation */

function addToLeafletMap(osmRels, computedDataRels, leafletState) {

  //* store old layers references for the layer control
  // this will be cleared by garbage collection
  const oldBase = leafletState.baseLayer;
  const oldChoro = leafletState.choroplethLayer;
  // clear highlighted
  leafletState.highlightedLayer = null;

  //* remove previous layers except tile layers
  if (leafletState.baseLayer) leafletState.map.removeLayer(leafletState.baseLayer);
  if (leafletState.choroplethLayer) leafletState.map.removeLayer(leafletState.choroplethLayer);

  //* base tile layer
  if (!leafletState.tileLayer) {
    // save tile layer of leaflet state
    leafletState.tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(leafletState.map);
  }

  //* conver to geojson
  const geojson = osmtogeojson({ 'elements': osmRels });

  if (leafletState.type === 'base') {
    //* base layer
    leafletState.baseLayer = L.geoJSON(geojson, {
      filter: (feature) => feature.geometry.type !== 'Point',
      // custom tooltip
      onEachFeature: (feature, layer) => onEachFeature(feature, layer, leafletState),
    });

    //* add layers
    leafletState.map.fitBounds(leafletState.baseLayer.getBounds());
    leafletState.baseLayer.addTo(leafletState.map);

    //* check if tags control panel was added, if not add it
    if (!leafletState.mapControl._map) {
      leafletState.mapControl.addTo(leafletState.map);
    }

    leafletState.map.off('click', leafletState.handleMapClick);
    leafletState.map.on('click', leafletState.handleMapClick);
  }

  //* add buttons
  if (!leafletState.centerBtn._map) {
    leafletState.centerBtn.addTo(leafletState.map);
  }

  if (leafletState.type === 'choropleth') {
    addChoroplethLayer(computedDataRels, geojson, L, leafletState, oldBase, oldChoro);
  }

}

//* compute ranges and colors
function getChoroplethParams(computedDataRels, prop) {
  const values = getValues(computedDataRels, prop);
  const ranges = getChoroplethRanges(values, 7);
  const colors = generateHueColors(7);

  const colorMap = new Map();
  computedDataRels.forEach(rel => {
    const val = rel[prop];
    colorMap.set('relation/' + rel.id, getColor(val, ranges, colors));
  });
  return [colorMap, colors, ranges]
}

function getValues(computedDataRels, prop) {
  return computedDataRels.reduce((acc, rel) => {
    const val = parseInt(rel[prop]);
    if (!isNaN(val)) acc.push(val);
    return acc;
  }, [])
}

function addChoroplethLayer(computedDataRels, geojson, L, leafletState, oldBase, oldChoro) {

  //* Choropleth layer
  // population layer
  leafletState.baseLayer = createChoroplethLayer(L, leafletState, geojson, ...getChoroplethParams(computedDataRels, 'population'));
  leafletState.map.fitBounds(leafletState.baseLayer.getBounds());
  leafletState.popDensityLayer = createChoroplethLayer(L, leafletState, geojson, ...getChoroplethParams(computedDataRels, 'popDensity'));


  leafletState.baseLayer.addTo(leafletState.map);
  leafletState.popDensityLayer.addTo(leafletState.map);

  //* add control layers
  if (!leafletState.layerControl) {
    leafletState.layerControl = L.control.layers(
      null,
      {
        'Population': leafletState.baseLayer,
        'Population density': leafletState.popDensityLayer,
      },
      { position: 'topleft' }
    ).addTo(leafletState.map);
  } else {
    // remove old overlays
    if (oldChoro) leafletState.layerControl.removeLayer(oldChoro);

    // add new ones
    leafletState.layerControl.addOverlay(leafletState.baseLayer, 'Population');
    leafletState.layerControl.addOverlay(leafletState.popDensityLayer, 'Population density');
  }

}

export { addToLeafletMap }