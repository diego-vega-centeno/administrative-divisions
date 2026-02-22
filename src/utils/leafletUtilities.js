import { icon } from '@fortawesome/fontawesome-svg-core';
import { faMapPin } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Main.module.css'

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
    'click': (event) => highlightFeature(event, leafletState),
    mouseover: (e) => {
      if (leafletState.highlightedLayer?.feature.id === e.target.feature.id) return;
      hoverHighlight(e, leafletState)
    },
    mouseout: (e) => {
      if (leafletState.highlightedLayer?.feature.id === e.target.feature.id) return;
      leafletState.baseLayer.resetStyle(e.target)
    },
  });
}

function hoverHighlight(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#608345ff',
    dashArray: '',
    fillOpacity: 0.7
  });

  layer.bringToFront();
}

function highlightFeature(event, leafletState) {

  // stop event propagation to prevent map click
  L.DomEvent.stopPropagation(event);

  // remove highlighted layer if it exist
  if (leafletState.highlightedLayer) {
    leafletState.baseLayer.resetStyle(leafletState.highlightedLayer);
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
    const div = L.DomUtil.create('div', 'leaflet-control');

    const btnContainer = L.DomUtil.create('div', styles['btn-toggle-container'], div);
    const btn = L.DomUtil.create('button', styles['btn-toggle'], btnContainer);
    btn.innerText = 'hide tags';
    const table = L.DomUtil.create('table', styles['leaflet-control-table'], div);
    const tbody = L.DomUtil.create('tbody', '', table);

    // prevent map other click events
    L.DomEvent.disableClickPropagation(div); // Handles mousedown, touchstart, dblclick, etc.
    L.DomEvent.disableScrollPropagation(div); // Handles mousewheel

    // disable other mouse events
    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.disableScrollPropagation(btn);

    // add toggle btn listener
    L.DomEvent.on(btn, 'click', () => buttonClickHandler(leafletState, table, btn));

    leafletState.mapControl.btn = btn;
    leafletState.mapControl.table = table;
    leafletState.mapControl.tbody = tbody;

    return div;
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
      state.map.fitBounds(state.baseLayer.getBounds());
    }

    L.DomEvent.disableClickPropagation(button);
    return button;
  }
})

//* create button instance
function createCenterButton(leafletState) {
  // create center button instance and add to leafletState
  leafletState.centerBtn = new L.Control.Button({ leafletState });
}

//* utility functions

//* update tags panel
function updateTagsPanel(leafletState, tags, id) {

  const control = leafletState.mapControl;

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

  control.btn.innerText = leafletState.mapControlIsCollapsed ? 'show tags' : 'hide tags';
  control.table.classList.toggle(styles['hidden'], leafletState.mapControlIsCollapsed);
  control.tbody.innerHTML = rows;
}

//* toggle tags panel
function buttonClickHandler(leafletState, table, btn) {
  if (leafletState.mapControlIsCollapsed) {
    table.classList.remove(styles['hidden']);
    btn.innerText = 'hide tags';
    leafletState.mapControlIsCollapsed = false;
  } else {
    table.classList.add(styles['hidden']);
    btn.innerText = 'show tags';
    leafletState.mapControlIsCollapsed = true;
  }
}


export { makeTagsPanel, onEachFeature, highlightFeature, createCenterButton }