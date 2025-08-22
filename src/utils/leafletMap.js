import osmtogeojson from 'osmtogeojson';

function addToLeafletMap(osmBaseData, map) {
  // make a deep copy of data
  const osmData = JSON.parse(JSON.stringify(osmBaseData));

  const geojsonData = osmtogeojson(osmData);
  console.log(geojsonData);
  console.log(map);
}

export { addToLeafletMap }