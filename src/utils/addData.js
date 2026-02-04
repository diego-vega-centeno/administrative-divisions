import addFlatData from '../add_flat.json'

const childrenIndex = {};
const dataIndex = {};

// indexes creation is O(n)
addFlatData.forEach(ele => {
  // children
  if (!childrenIndex[ele.parent]) childrenIndex[ele.parent] = [];
  childrenIndex[ele.parent].push(ele);

  // all relation data
  dataIndex[ele.id] = ele;
});


export { childrenIndex, dataIndex }