import styles from '../styles/Main.module.css'

function createChoroplethLayer(L, leafletState, geojson, colorMap, colors, ranges, legendTitle) {

  //* legend control
  if (leafletState.legendControl) leafletState.legendControl.remove();

  leafletState.legendControl = L.control({ position: 'bottomright' });

  leafletState.legendControl.onAdd = function (map) {

    const div = L.DomUtil.create('div', `${styles['info']} ${styles['legend']}`);
    const grades = ranges.map(range => range[0]).reverse();
    div.innerHTML = `<div style="text-align: center; font-weight:bold">${legendTitle}</div>`;
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=

        '<i style="background:' + getColor(grades[i] + 1, ranges, colors) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    leafletState.legendControl.div = div;
    return div;
  };

  leafletState.legendControl.addTo(leafletState.map);


  return (
    L.geoJSON(geojson, {
      filter: (feature) => feature.geometry.type !== 'Point',
      // custom tooltip
      // onEachFeature: (feature, layer) => onEachFeature(feature, layer, leafletState),
      style: (feature) => style(feature, colorMap)
    })
  )
}


//* utility functions

function generateHueColors(num) {
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

function getChoroplethRanges(values, num) {
  let divisionsNum = num;
  if (values.length < num) {
    divisionsNum = values.length;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / divisionsNum;

  const ranges = [];
  let start = Math.floor(min);
  for (let i = 0; i < divisionsNum; i++) {
    let end = (i === divisionsNum - 1) ? Math.ceil(max) : Math.floor(min + (i + 1) * step);
    ranges.push([start, end]);
    start = end + 1;
  }

  return ranges;
}

function getColor(val, ranges, colors) {
  // const colors = ['#FED976', '#FDD06D', '#FCC464', '#FBAC52', '#FA843F', '#F95B2D', '#E9341D', '#D50027', '#A00025', '#800026'];
  // const colors = ['#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

  for (let i = 0; i < ranges.length; i++) {
    if (i === ranges.length - 1) return colors[i];
    if (val >= ranges[i][0] && val < ranges[i][1]) {
      return colors[i];
    }
  }

  return '#ccc';
}

function style(feature, colorMap) {
  return {
    fillColor: colorMap.get(feature.id) ?? '#ccc',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}


function updateLegend(L, leafletState, colorMap, colors, ranges, legendTitle) {

  const div = leafletState.legendControl.div;

  const grades = ranges.map(range => range[0]).reverse();
  div.innerHTML = `<div style="text-align: center; font-weight:bold">${legendTitle}</div>`;
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1, ranges, colors) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

}

export { createChoroplethLayer, getChoroplethRanges, getColor, generateHueColors, updateLegend }