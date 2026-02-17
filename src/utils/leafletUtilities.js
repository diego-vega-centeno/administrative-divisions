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

export {onEachFeature, highlightFeature}