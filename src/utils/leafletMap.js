import osmtogeojson from 'osmtogeojson';
import L from 'leaflet';
import { createChoroplethLayer } from './leafletChoroplethLayer';
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
  leafletState.map.eachLayer(function (layer) {
    if (!(layer instanceof L.TileLayer)) {
      leafletState.map.removeLayer(layer);
    }
  });

  //* base tile layer
  if (!leafletState.tileLayer) {
    // save tile layer of leaflet state
    leafletState.tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(leafletState.map);
  }

  //* base layer
  leafletState.baseLayer = L.geoJSON(osmtogeojson(osmBaseData), {
    filter: (feature) => !feature.id.includes('node'),
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

  //* clear content of control
  leafletState.mapControl.div.innerHTML = "";

  leafletState.map.off('click', leafletState.handleMapClick);
  leafletState.map.on('click', leafletState.handleMapClick);


  //* add buttons
  if (!leafletState.centerBtn._map) {
    leafletState.centerBtn.addTo(leafletState.map);
  }


  addChoroplethLayer(osmBaseData, L, leafletState, oldBase, oldChoro);
}

function addChoroplethLayer(osmBaseData, L, leafletState, oldBase, oldChoro) {
  //* Choropleth layer
  leafletState.choroplethLayer = createChoroplethLayer(L, leafletState, osmBaseData);

  //* add control layers
  if (!leafletState.layerControl) {
    leafletState.layerControl = L.control.layers(
      { 'OpenStreetMap': leafletState.tileLayer },
      {
        'Base': leafletState.baseLayer,
        'Choropleth': leafletState.choroplethLayer,
      },
      { position: 'topleft' }
    ).addTo(leafletState.map);
  } else {
    // remove old overlays
    if (oldBase) leafletState.layerControl.removeLayer(oldBase);
    if (oldChoro) leafletState.layerControl.removeLayer(oldChoro);

    // add new ones
    leafletState.layerControl.addOverlay(leafletState.baseLayer, 'Base');
    leafletState.layerControl.addOverlay(leafletState.choroplethLayer, 'Choropleth');
  }

}

export { addToLeafletMap }