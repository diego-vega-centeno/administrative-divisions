async function getRelationsOSMData(ids, out = "geom") {

  if (ids.length === 0) throw new Error("Please select some divisions");

  const endPoint = "https://overpass-api.de/api/interpreter";

  // to accept an array
  const idsArray = ((typeof ids) == "number") ? [ids] : ids;

  const query = `
    [out:json][timeout:90];
    rel(id:${idsArray.join(",")});
    out ${out};
    `;

  const response = await fetch(endPoint, { method: "POST", body: ("data=" + encodeURIComponent(query)) });

  if (!response.ok) {
    // A 'not ok' response doesn't throw an error, so throw one and add the response object
    throw new Error("Fetch response was not ok");
  }

  const osmRes = await response.json();

  if (osmRes.elements.length === 0) {
    throw new Error("Fetch response has empty elements");
  }

  return osmRes;
}

function formatData(osmData, structure, include, selectedNodes) {

  // modify in place
  let outputElements = osmData.elements;

  // include jstree data
  const jstreeDataIndex = {};
  selectedNodes.forEach(ele => {
    jstreeDataIndex[ele.id] = ele;
  });

  outputElements.forEach(ele => {
    const parentID = jstreeDataIndex[ele.id]['parent'];
    ele['parent'] = parentID === '#' ? 0 : parseInt(parentID);
    ele['parents'] = jstreeDataIndex[ele.id]['parents'].map(id => {
      return id === '#' ? 0 : parseInt(id);
    });
    ele['children'] = jstreeDataIndex[ele.id]['children'].map(id => parseInt(id));
  });

  if (!include.tags) {
    outputElements.forEach(ele => {
      delete ele.tags
    });
  }

  if (structure === 'tree') {
    const normalized = normalizeSelection(outputElements);
    outputElements = makeTree(normalized);
  };

  return outputElements;
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
    delete newNode.parents;
    return newNode
  })
}

export { getRelationsOSMData, formatData }