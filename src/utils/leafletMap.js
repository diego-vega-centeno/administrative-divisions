import osmtogeojson from 'osmtogeojson';
import L from 'leaflet';
import styles from '../styles/Main.module.css'
import { icon } from '@fortawesome/fontawesome-svg-core';
import { faMapPin } from '@fortawesome/free-solid-svg-icons';

/* main leaflet map creation */

function addToLeafletMap(osmBaseData, leafletState) {

  // remove previous layers except tile layers
  leafletState.map.eachLayer(function (layer) {
    if (!(layer instanceof L.TileLayer)) {
      leafletState.map.removeLayer(layer);
    }
  });

  // create layer from geojson data
  leafletState.geojsonLayer = L.geoJSON(osmtogeojson(osmBaseData), {
    filter: function (feature, layer) {
      return !(feature.id.includes('node'));
    },
    // custom tooltip
    onEachFeature: (feature, layer) => onEachFeature(feature, layer, leafletState),
  });

  // fit bounds to new layer
  leafletState.map.fitBounds(leafletState.geojsonLayer.getBounds());

  // check if tile layer exists, if not create one
  let tileLayer;
  leafletState.map.eachLayer(function (layer) {
    if (layer instanceof L.TileLayer) {
      tileLayer = layer;
    }
  });

  if (!tileLayer) {
    tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tileLayer.addTo(leafletState.map);
    leafletState.tileLayer = tileLayer;
  }
  leafletState.geojsonLayer.addTo(leafletState.map);

  // check if tags control panel was added, if not add it
  if (!leafletState.mapControl._map) {
    leafletState.mapControl.addTo(leafletState.map);
  }

  // clear content of control
  leafletState.mapControl.div.innerHTML = "";

  leafletState.map.off('click', leafletState.handleMapClick);
  leafletState.map.on('click', leafletState.handleMapClick);


  // add buttons
  if (!leafletState.centerBtn._map) {
    leafletState.centerBtn.addTo(leafletState.map);
  }
}

/* Custom tooltip function */

function onEachFeature(feature, layer, leafletState) {

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
    'click': (event) => highlightFeature(event, leafletState)
  });

}

function highlightFeature(event, leafletState) {

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
  leafletState.mapControl.updateTagsPanel(leafletState, tags, layer.feature.id);

}


//* tags panel creation

function makeTagsPanel(leafletState) {

  //* create instance and dom container
  leafletState.mapControl = new L.Control();
  // create and return dom element container
  leafletState.mapControl.onAdd = function (map) {
    this.div = L.DomUtil.create('div');
    this.div.innerHTML = "";
    // prevent map other click events
    L.DomEvent.disableClickPropagation(this.div); // Handles mousedown, touchstart, dblclick, etc.
    L.DomEvent.disableScrollPropagation(this.div); // Handles mousewheel

    return this.div;
  }

  //* handle the update of the control panel with new tags and id
  leafletState.mapControl.updateTagsPanel = updateTagsPanel;
}

//* center button creation

// class creation
L.Control.Button = L.Control.extend({
  options: {
    position: 'topleft',
    leafletState: null
  },
  onAdd: function (map) {
    const button = L.DomUtil.create('button', 'leaflet-btn');
    const svgFaMapPin = icon(faMapPin).html[0];
    button.innerHTML = `<div class="${styles['leaflet-btn']}">${svgFaMapPin}</div>`;

    button.onclick = () => {
      const state = this.options.leafletState;
      if (state.geojsonLayer) {
        state.map.fitBounds(state.geojsonLayer.getBounds());
      }
    }

    L.DomEvent.disableClickPropagation(button);
    return button;
  }
})

// create button instance
function creatCenterButton(leafletState) {
  // create center button instance and add to leafletState
  leafletState.centerBtn = new L.Control.Button({ leafletState });
}



//* utility functions

//* update tags panel
function updateTagsPanel(leafletState, tags, id) {

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

    let row = `<tr class="${styles['leaflet-control-table-row']}">
            <th class="${styles['leaflet-control-table-cell']}">${key}</th>
            <td class="${styles['leaflet-control-table-cell']}">${value}</td>
        </tr>`

    rows += row;
  }

  // add control panel with updated info
  leafletState.mapControl.div.innerHTML =
    `<div>
      <div class="${styles['btn-toggle-container']}">
        <button id='btn-toggle' class="${styles['btn-toggle']}">➖</button>
      </div>
      <table id='leaflet-control-table' class="${styles['leaflet-control-table']}">
        <tbody>
            ${rows}
        </tbody>
      </table>
    </div>
    `;

  //* button to hide table
  const btn = leafletState.mapControl.div.querySelector('#btn-toggle');
  const table = leafletState.mapControl.div.querySelector('#leaflet-control-table');
  // previous listener is gone because button is destroyed by using innerHTML

  // disable other mouse events
  L.DomEvent.disableClickPropagation(btn);
  L.DomEvent.disableScrollPropagation(btn);

  // add new event listener
  L.DomEvent.on(btn, 'click', () => buttonClickHandler(table, btn));
}

//* toggle tags panel
function buttonClickHandler(table, btn) {

  if (table.style.display !== 'none') {
    table.style.display = 'none'
    btn.innerText = '➕'  // collapsed

  } else {
    table.style.display = 'table';
    btn.innerText = '➖'  // expanded
  }
}


export { addToLeafletMap, makeTagsPanel, creatCenterButton }