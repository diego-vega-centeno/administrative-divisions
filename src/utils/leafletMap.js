import osmtogeojson from 'osmtogeojson';
import L from 'leaflet';
import styles from '../styles/Main.module.css'

// initial map state
const leafletState = {
  geojsonLayer: null,
  highlightedLayer: null,
  mapControl: null
};

/* main leaflet map creation */

async function addToLeafletMap(osmBaseData, map) {
  // remove previous layer
  if (leafletState.geojsonLayer) {
    map.removeLayer(leafletState.geojsonLayer);
  }

  // create layer from geojson data
  leafletState.geojsonLayer = L.geoJSON(osmtogeojson(osmBaseData), {
    filter: function (feature, layer) {
      return !(feature.id.includes('node'));
    },
    // custom tooltip
    onEachFeature: onEachFeature,
  });

  // remove previous layers except tile layers
  map.eachLayer(function (layer) {
    if (!(layer instanceof L.TileLayer)) {
      map.removeLayer(layer);
    }
  });

  // fit bounds to new layer
  map.fitBounds(leafletState.geojsonLayer.getBounds());

  // check if tile layer exists, if not create one
  let tileLayer;
  map.eachLayer(function (layer) {
    if (layer instanceof L.TileLayer) {
      tileLayer = layer;
    }
  });

  if (!tileLayer) {
    tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tileLayer.addTo(map);
    leafletState.tileLayer = tileLayer;
  }
  leafletState.geojsonLayer.addTo(map);

  // check and add control panel
  if (!leafletState.mapControl._map) {
    leafletState.mapControl.addTo(map);
  }
  // clearn content of control
  leafletState.mapControl.div.innerHTML = "";

  // unhighlight on click outside a feature
  function handleMapClick(e) {
    if (leafletState.highlightedLayer) {
      leafletState.geojsonLayer.resetStyle(leafletState.highlightedLayer);
      leafletState.highlightedLayer = null;
      leafletState.mapControl.div.innerHTML = "";
    }
  }
  map.off('click', handleMapClick);
  map.on('click', handleMapClick);
}

/* Custom tooltip function */

function onEachFeature(feature, layer) {

  const id = feature.id || feature.properties?.id || '';
  const name = feature.properties?.['name:en'] ||
    feature.properties?.['name'] ||
    feature.properties?.['alt_name:en'] ||
    'Missing name';

  layer.bindTooltip(
    `<span 
            class="custom-bindPopup" 
            href="https://www.openstreetmap.org/relation/${feature.properties.id.replace("relation/", "")}">
             ${name}
        </span>`
  );

  layer.on({
    // 'e' is the event and 'this' is the layer
    // the layer created with each applied feature
    'mouseover': function (e) {
      this.openTooltip();
    },
    'click': highlightFeature
  });

}

function highlightFeature(event) {

  // stop event propagation to prevent map click
  L.DomEvent.stopPropagation(event);

  // remove highlighted layer if it exist
  if (leafletState.highlightedLayer) {
    leafletState.geojsonLayer.resetStyle(leafletState.highlightedLayer);
  }

  const layer = event.target;
  layer.setStyle({
    color: "red"
  });

  layer.bringToFront();
  leafletState.highlightedLayer = layer;

  // update info panel
  const tags = layer.feature.properties;
  // custom function added to control object
  leafletState.mapControl.updatePanel(tags, layer.feature.id);

}


/* map control panel */

leafletState.mapControl = L.control();
// create and return dom element container
leafletState.mapControl.onAdd = function (map) {
  this.div = L.DomUtil.create('div');
  this.div.innerHTML = "";
  // prevent map click when clicking on control panel
  L.DomEvent.on(this.div, 'click', L.DomEvent.stopPropagation);
  return this.div;
}


// handle the update of the control panel with new tags and id
leafletState.mapControl.updatePanel = function (tags, id) {

  let rows = "";
  const tagsToUse = ["admin_level", "name:en", "name", "population", "population:date", "wikipedia", "wikidata"];

  const filteredTags = Object.keys(tags).filter(ele => tagsToUse.includes(ele));
  // to include link to OSM
  filteredTags.unshift('OSM id');

  for (const key of filteredTags) {

    let value;

    switch (key) {
      case "wikipedia":
        value = `<a href="https://en.wikipedia.org/wiki/${tags[key]}">${tags[key]}</a>`;
        break;
      case "wikidata":
        value = `<a href="https://www.wikidata.org/wiki/${tags[key]}">${tags[key]}</a>`;
        break;
      case "OSM id":
        value = `<a href="https://www.openstreetmap.org/relation/${id.replace('relation/', '')}">${id.replace('relation/', '')}</a>`;
        break;
      default:
        value = `${tags[key]}`;
        break;
    }

    let row = `<tr class="${styles['leaflet-control-panel-row']}">
            <th class="${styles['leaflet-control-panel-cell']}">${key}</th>
            <td class="${styles['leaflet-control-panel-cell']}">${value}</td>
        </tr>`

    rows += row;
  }

  leafletState.mapControl.div.innerHTML =
    `<table class="${styles['leaflet-control-panel']}">
      <button id='btn-toogle'>damn</button>
        <tbody>
            ${rows}
        </tbody>
    </table>`;

  L.DomEvent.on(document.getElementById('btn-toogle'), 'click', function () {
    L.DomEvent.stopPropagation;
    // $(".leaflet-layers").removeClass("leaflet-control-expanded")
    console.log($(".leaflet-control"));
    console.log('H');
  });

}

export { addToLeafletMap }