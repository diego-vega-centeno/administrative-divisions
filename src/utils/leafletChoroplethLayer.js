
import osmtogeojson from 'osmtogeojson';
import { onEachFeature } from './leafletUtilities';

function createChoroplethLayer(L, leafletState, osmBaseData) {
  const pops = osmBaseData.elements.reduce((acc, rel) => {
    const val = parseInt(rel.tags.population);
    if (!isNaN(val)) acc.push(val);
    return acc;
  }, []);

  const ranges = getChoroplethRanges(pops, 7);
  const colors = generateHueColors(ranges.length);

  return (
    L.geoJSON(osmtogeojson(osmBaseData), {
      filter: function (feature, layer) {
        return !(feature.id.includes('node'));
      },
      // custom tooltip
      onEachFeature: (feature, layer) => onEachFeature(feature, layer, leafletState),
      style: (feature) => style(feature, ranges, colors)
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

// function generateColors(num) {
//   const start = 200;
//   const end = 50;
//   const colors = [];
//   for (let i = 0; i < num; i++) {
//     const t = i / (num - 1);
//     const r = Math.round(start + t * (end - start));
//     const g = Math.round(start + t * (end - start));
//     const b = Math.round(255);
//     colors.push(`rgb(${r},${g},${b})`);
//   }
//   return colors;
// }


function getChoroplethRanges(values, num) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / num;

  const ranges = [];
  for (let i = 0; i < num; i++) {
    ranges[i] = [min + i * step, min + (i + 1) * step]
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

function style(feature, ranges, colors) {
  return {
    fillColor: getColor(feature.properties.population, ranges, colors),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}


export { createChoroplethLayer }