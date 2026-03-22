import osmtogeojson from "osmtogeojson";
import { putStoreRelations, getStoreRelation } from "./indexedDB";
import logger from "./logger";
import {
  JstreeNode,
  formatOsmRel,
  SelectedNodesType,
  osmRel,
} from "../types/index.js";

async function getRelationsOSMData(ids: string[], out = "geom") {
  const endPoints = [
    "https://maps.mail.ru/osm/tools/overpass/api/",
    // "https://overpass.openstreetmap.fr/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    // "https://overpass.openstreetmap.ru/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];

  // to accept an array
  const idsArray = typeof ids == "string" ? [ids] : ids;

  const query = `[out:json][timeout:90];rel(id:${idsArray.join(",")});out ${out};`;
  let response;
  for (const endpoint of endPoints) {
    logger.info(`Trying endpoint: ${endpoint}`);
    response = await fetch(endpoint + "?data=" + encodeURIComponent(query));

    if (response.ok) {
      const osmRes = await response.json();
      if (osmRes.elements.length === 0) {
        throw new Error("Fetch response has empty elements");
      }
      return osmRes;
    }

    logger.info(`endpoint failed`);
  }

  // if no endpoint returned ok then throw
  // A 'not ok' response doesn't throw an error, so throw one and add status
  throw new Error(
    `Fetch response was not ok: ${response!.status} - ${response!.statusText}`,
  );
}

function formatData(
  osmElems: any[],
  params: Record<string, any>,
  selectedNodes: SelectedNodesType,
) {
  if (params.format === "geojson") {
    // for geojson include jstree data but inside the tags prop
    const jstreeDataIndex = {} as Record<string, JstreeNode>;
    selectedNodes.forEach((ele) => {
      jstreeDataIndex[ele.id] = ele;
    });

    osmElems.forEach((ele) => {
      const parentID = jstreeDataIndex[ele.id].parent;
      ele.tags!.parent = parentID === "#" ? "#" : "relation/" + parentID;
      ele.tags!.parents = jstreeDataIndex[ele.id].parents.map(
        (id) => "relation/" + id,
      );
      ele.tags!.children = jstreeDataIndex[ele.id].children.map(
        (id) => "relation/" + id,
      );
    });
    return osmtogeojson({ elements: osmElems });
  }

  // include jstree data
  const jstreeDataIndex = {} as Record<string, JstreeNode>;
  selectedNodes.forEach((ele) => {
    jstreeDataIndex[ele.id] = ele;
  });

  osmElems.forEach((ele) => {
    const parentID = jstreeDataIndex[ele.id].parent;
    ele.parent = parentID === "#" ? 0 : parseInt(parentID);
    ele.parents = jstreeDataIndex[ele.id].parents.map((id) => {
      return id === "#" ? 0 : parseInt(id);
    });
    ele.children = jstreeDataIndex[ele.id].children.map((id) => parseInt(id));
  });

  // delete tags if checked
  if (!params.tags) {
    osmElems.forEach((ele) => {
      delete ele.tags;
    });
  }

  // convert to geojson and add data to relations
  if (params.geom && params.geojsonInOSM) {
    const clonedElems = JSON.parse(JSON.stringify(osmElems));
    const features = osmtogeojson({ elements: clonedElems }).features.filter(
      (feature) => {
        return String(feature.id)!.includes("relation");
      },
    );
    const geojsonMap = new Map(
      features.map((feature) => {
        return [
          feature.id!.toString().replace("relation/", ""),
          feature.geometry,
        ];
      }),
    );
    osmElems.forEach((ele) => {
      ele["geometry"] = geojsonMap.get(ele.id.toString());
    });
  }

  // make tree data
  if (params.structure === "tree") {
    const normalized = normalizeSelection(osmElems);
    return makeTree(normalized);
  }

  return osmElems;
}

type NodeWithSelected = Pick<formatOsmRel, "parent"> & {
  id: number;
  type: "relation";
  selected: boolean;
};

function normalizeSelection(nodes: formatOsmRel[]) {
  const map = new Map<string, any>(
    nodes.map((node) => [String(node.id), { ...node, selected: true }]),
  );
  const allNodes = [...map.values()];

  for (const node of nodes) {
    if (node.parents) {
      for (const pid of node.parents) {
        if (!map.has(pid.toString()) && pid !== 0) {
          const implicitNode: NodeWithSelected = {
            type: "relation",
            parent: node.parents[node.parents.indexOf(pid) + 1] || 0,
            id: pid,
            selected: false,
          };
          map.set(pid.toString(), implicitNode);
          allNodes.push(implicitNode);
        }
      }
    }
  }

  return allNodes;
}

function makeTree(nodes: formatOsmRel[], parentID = 0): object[] {
  // get children of the current parent
  const children = nodes.filter((node) => node["parent"] === parentID);
  // make the children's subtree by passing the node.id
  return children.map((node) => {
    const subtree = makeTree(nodes, parseInt(node.id));
    const newNode = {
      ...node,
      children: subtree.length === 0 ? node.children : subtree,
    };
    return newNode;
  });
}

function donwloadJSONData(content: any, filename: string) {
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(content, null, 2)], {
    type: "application/json",
  });
  // createObjectURL makes the file available in disk to use as href
  a.href = URL.createObjectURL(file);
  a.download = filename;
  // wait and then revoke the object
  a.addEventListener("click", function () {
    setTimeout(() => URL.revokeObjectURL(a.href), 200);
  });
  a.click();
}

async function getRelationsDataWithCache(ids: string[]) {
  // obtain relation from cache if present
  const cachedRels = await getStoreRelation(ids.map((id) => parseInt(id)));
  const cachedIdSet = new Set(cachedRels.map((rel) => rel.id.toString()));
  logger.info(`IndexedDB: ${cachedIdSet.size} ids found: ${[...cachedIdSet]}`);

  const nonCachedIds = ids.filter((id) => !cachedIdSet.has(id));

  // get osm data
  let queryRels = [];
  if (nonCachedIds.length) {
    queryRels = (await getRelationsOSMData(nonCachedIds))["elements"];
  }

  // join cached data
  logger.info(
    `IndexedDB: In cache ${cachedRels.length}, non-cached: ${queryRels.length}`,
  );
  const osmRels = [...queryRels, ...cachedRels];

  // store query rels
  putStoreRelations(queryRels);
  logger.info(`IndexedDB: ${queryRels.length} added to cache`);

  return osmRels;
}

function profileSize(rels: osmRel[]) {
  let sum = 0;
  rels.forEach((elem) => {
    let sizeInBytes = new Blob([JSON.stringify(elem)]).size;
    sum += sizeInBytes / 1024;
    logger.info(
      `Poly profile: elem id: ${elem.id}, size (KB): ${sizeInBytes / 1024}`,
    );
  });
  let sizeInBytes = new Blob([JSON.stringify(rels)]).size;
  logger.info(`Poly profile: Total rels size (KB): ${sizeInBytes / 1024}`);

  logger.info(`Poly profile: Average size (KB): ${sum / rels.length}`);
}

export {
  getRelationsOSMData,
  formatData,
  donwloadJSONData,
  getRelationsDataWithCache,
  profileSize,
};
