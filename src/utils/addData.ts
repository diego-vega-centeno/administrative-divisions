// import addFlatData from '../add_flat.json'

// const childrenIndex = {};
// const dataIndex = {};

// indexes creation is O(n)
// addFlatData.forEach(ele => {
//   // children
//   if (!childrenIndex[ele.parent]) childrenIndex[ele.parent] = [];
//   childrenIndex[ele.parent].push(ele);

//   // all relation data
//   dataIndex[ele.id] = ele;
// });

let parentIndexCache = {} as Record<string, string>;

// get parent names wihout creating a complete index
// function getParentNames(id: string) {
//   if (parentIndexCache[id]) return parentIndexCache[id];

//   let parentNames = [];
//   let currId = id;
//   // O(k) ; k number of parents
//   while (currId != "#") {
//     const curr = dataIndex[currId];
//     if (!curr) break;

//     // O(1)
//     const parentId = curr.parent;
//     if (parentId !== "#") {
//       parentNames.push(dataIndex[parentId]?.text);
//     }
//     currId = parentId;
//   }

//   const result = parentNames.length ? parentNames.join("/") : "World";
//   parentIndexCache[id] = result;

//   return result;
// }

// free the array
// it's not actually duplicate data
// the object references still exists but the original array is not needed
// addFlatData.length = 0;

// export { dataIndex, getParentNames };
