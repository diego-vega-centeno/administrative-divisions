import osmtogeojson from 'osmtogeojson';

async function addToLeafletMap(osmBaseData, map) {
  // make a deep copy of data
  const osmData = JSON.parse(JSON.stringify(osmBaseData));

  // create layer from geojson data
  const geojsonLayer = L.geoJSON(osmtogeojson(osmData), {
    filter: function (feature, layer) {
      return !(feature.id.includes('node'));
    }
  });

  // remove previous layers
  map.eachLayer(function (layer) {
    map.removeLayer(layer);
  });

  // fit bounds to new layer
  map.fitBounds(geojsonLayer.getBounds());

  // populate with tiles
  const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 15,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  // add all layers
  layer.addTo(map);
  geojsonLayer.addTo(map);
}

export { addToLeafletMap }