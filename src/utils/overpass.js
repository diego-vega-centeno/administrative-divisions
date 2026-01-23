import osmtogeojson from "osmtogeojson";
import { putStoreRelations, getStoreRelation } from '../utils/indexedDB.js';
import { debugLog } from "./logger.js";

async function getRelationsOSMData(ids, out = "geom") {

  const endPoint = "https://maps.mail.ru/osm/tools/overpass/api/interpreter";

  // to accept an array
  const idsArray = ((typeof ids) == "number") ? [ids] : ids;

  const query = `[out:json][timeout:90];rel(id:${idsArray.join(",")});out ${out};`;

  const response = await fetch(endPoint + "?data=" + encodeURIComponent(query));

  if (!response.ok) {
    // A 'not ok' response doesn't throw an error, so throw one and add status
    throw new Error(`Fetch response was not ok: ${response.status} - ${response.statusText}`);
  }

  const osmRes = await response.json();

  if (osmRes.elements.length === 0) {
    throw new Error("Fetch response has empty elements");
  }

  return osmRes;
}

function formatData(osmElems, params, selectedNodes) {

  if (params.format === 'geojson') {
    return osmtogeojson({ "elements": osmElems });
  }

  // include jstree data
  const jstreeDataIndex = {};
  selectedNodes.forEach(ele => {
    jstreeDataIndex[ele.id] = ele;
  });

  osmElems.forEach(ele => {
    const parentID = jstreeDataIndex[ele.id]['parent'];
    ele['parent'] = parentID === '#' ? 0 : parseInt(parentID);
    ele['parents'] = jstreeDataIndex[ele.id]['parents'].map(id => {
      return id === '#' ? 0 : parseInt(id);
    });
    ele['children'] = jstreeDataIndex[ele.id]['children'].map(id => parseInt(id));
  });

  // delete tags if checked
  if (!params.tags) {
    osmElems.forEach(ele => {
      delete ele.tags
    });
  }

  // convert to geojson and add data to relations
  if (params.geom && params.geojsonInOSM) {
    const features = osmtogeojson({ "elements": osmElems }).features.filter(feature => {
      return feature.id.includes('relation');
    });
    const geojsonMap = new Map(features.map(feature => {
      return [parseInt(feature.id.replace('relation/', '')), feature.geometry]
    }));
    osmElems.forEach(ele => {
      ele['geometry'] = geojsonMap.get(ele.id);
    });
  };

  // make tree data
  if (params.structure === 'tree') {
    const normalized = normalizeSelection(osmElems);
    osmElems = makeTree(normalized);
  };


  return osmElems;
}

function normalizeSelection(nodes) {

  const map = new Map(nodes.map(node => [node.id, { ...node, selected: true }]));
  const allNodes = [...map.values()];

  for (const node of nodes) {
    if (node.parents) {
      for (const pid of node.parents) {
        if (!map.has(pid) && pid !== 0) {
          const implicitNode = {
            type: 'relation',
            parent: node.parents[node.parents.indexOf(pid) + 1] || 0,
            id: pid,
            selected: false
          };
          map.set(pid, implicitNode);
          allNodes.push(implicitNode);
        }
      }
    }
  }

  return allNodes;
}

function makeTree(nodes, parentID = 0) {
  // get children of the current parent
  const children = nodes.filter(node => node['parent'] === parentID);
  // make the children's subtree by passing the node.id
  return children.map(node => {
    const subtree = makeTree(nodes, node.id);
    const newNode = { ...node, children: subtree.length === 0 ? node.children : subtree };
    return newNode
  })
}

function donwloadJSONData(content, filename) {
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  // createObjectURL makes the file available in disk to use as href
  a.href = URL.createObjectURL(file);
  a.download = filename;
  // wait and then revoke the object
  a.addEventListener("click", function () {
    setTimeout(() => URL.revokeObjectURL(a.href), 200);
  });
  a.click();
}

async function getRelationsDataWithCache(nodes) {
  // obtain relation from cache if present
  const cachedRels = [];
  for (const node of nodes) {
    // object key is id(int), node is id(string)
    const rel = await getStoreRelation(parseInt(node.id));
    if (rel) cachedRels.push(rel);
  }
  const cachedIds = cachedRels.map(rel => rel.id.toString());
  const nonCached = nodes.filter(node => !cachedIds.includes(node.id));

  // get osm data
  let queryRels = [];
  if (nonCached.length) {
    queryRels = (await getRelationsOSMData(nonCached.map(node => node.id)))['elements'];
  }

  // join cached data
  debugLog(`Relations: In cache ${cachedRels.length}, non-cached: ${queryRels.length}`);
  const osmRels = [...queryRels, ...cachedRels];

  // store >= 400KB relations
  // const largeRels = queryRels.filter(rel => {
  //   const sizeInBytes = new Blob([JSON.stringify(rel)]).size;
  //   return sizeInBytes >= 400 * 1024;
  // });

  // const smallRels = queryRels.filter(rel => {
  //   const sizeInBytes = new Blob([JSON.stringify(rel)]).size;
  //   return sizeInBytes < 400 * 1024;
  // });
  // debugLog(`Relations: Added to cache: ${largeRels.length}, skipped: ${smallRels.length}`);

  // store query rels
  putStoreRelations(queryRels);
  debugLog(`Relations: Added to cache: ${queryRels.length}`);

  return osmRels
}

function profileSize(rels) {
  let sum = 0;
  rels.forEach(elem => {
    let sizeInBytes = new Blob([JSON.stringify(elem)]).size;
    sum += sizeInBytes / 1024;
    debugLog(`elem id: ${elem.id}, size (KB): ${sizeInBytes / 1024}`);
  });
  let sizeInBytes = new Blob([JSON.stringify(rels)]).size;
  debugLog(`Total rels size (KB): ${sizeInBytes / 1024}`);

  debugLog(`Average size (KB): ${sum / rels.length}`)
}

export { getRelationsOSMData, formatData, donwloadJSONData, getRelationsDataWithCache, profileSize }