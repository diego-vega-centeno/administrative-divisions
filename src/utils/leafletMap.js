import osmtogeojson from 'osmtogeojson';
import L from 'leaflet';
import {
  createChoroplethLayer,
  getChoroplethRanges, getColor, generateHueColors
} from './leafletChoroplethLayer';
import { onEachFeature } from './leafletUtilities';

/* main leaflet map creation */

function addToLeafletMap(osmBaseData, leafletState) {

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
  const geojson = osmtogeojson(osmBaseData);

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
    addChoroplethLayer(osmBaseData, geojson, L, leafletState, oldBase, oldChoro);
  }

}

function addChoroplethLayer(osmBaseData, geojson, L, leafletState, oldBase, oldChoro) {

  //* compute ranges and colors
  const pops = osmBaseData.elements.reduce((acc, rel) => {
    const val = parseInt(rel.tags.population);
    if (!isNaN(val)) acc.push(val);
    return acc;
  }, []);
  const ranges = getChoroplethRanges(pops, 7);
  const colors = generateHueColors(ranges.length);

  const colorMap = new Map();
  geojson.features.forEach(f => {
    const val = f.properties.population;
    colorMap.set(f.id, getColor(val, ranges, colors));
  });

  //* Choropleth layer
  leafletState.choroplethLayer = createChoroplethLayer(L, leafletState, geojson, colorMap, colors, ranges);
  leafletState.map.fitBounds(leafletState.choroplethLayer.getBounds());
  leafletState.choroplethLayer.addTo(leafletState.map);

  //* add control layers
  if (!leafletState.layerControl) {
    leafletState.layerControl = L.control.layers(
      null,
      {
        'Population': leafletState.choroplethLayer,
      },
      { position: 'topleft' }
    ).addTo(leafletState.map);
  } else {
    // remove old overlays
    if (oldChoro) leafletState.layerControl.removeLayer(oldChoro);

    // add new ones
    leafletState.layerControl.addOverlay(leafletState.baseLayer, 'Base');
    leafletState.layerControl.addOverlay(leafletState.choroplethLayer, 'Population');
  }

}

export { addToLeafletMap }