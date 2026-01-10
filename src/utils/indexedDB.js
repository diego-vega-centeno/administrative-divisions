const DB_NAME = 'osm-cache';
const DB_VERSION = 1;
const STORE_NAME = 'relations';

let db;

if (!indexedDB) {
  console.log("Your browser doesn't support IndexedDB.");
}

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = (event) => {
  console.log(`Database error: ${event.target.errorCode}`);
}

request.onsuccess = (event) => {
  db = request.result;
  console.log(`Database openend successfully: ${JSON.stringify(db.objectStoreNames)}`);
}

// triggered when higher version is used in open() than the one used previously 
request.onupgradeneeded = (event) => {
  db = event.target.result;

  if (!db.objectStoreNames.contains(STORE_NAME)) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
  };
}

function makeTransaction(storeName) {
  const transaction = db.transaction(storeName, 'readwrite')
  transaction.oncomplete = (event) => {
    console.log('Transaction successful');
  }
  transaction.onerror = (event) => {
    event.stopPropagation();
    console.log(`There was an error: ${event.message}`);
  }

  const store = transaction.objectStore(storeName);
  return store;
}

function putStoreRelations(relations) {
  const store = makeTransaction(STORE_NAME);

  relations.forEach(rel => {
    const request = store.put(rel);
    request.onsuccess = () => {
      console.log(`Object added id: ${request.result}`);
    };

    request.onerror = () => {
      console.log(`Error while adding relation: ${request.error}`);
    }
  });
}

function getStoreRelation(id) {
  return new Promise((resolve, reject) => {
    const store = makeTransaction(STORE_NAME);
    const request = store.get(parseInt(id));

    request.onsuccess = () => {
      console.log(`Object obtained id: ${request.result?.id}`);
      resolve(request.result);
    };

    request.onerror = () => {
      console.log(`Error while getting relation: ${request.error}`);
      reject(request.error);
    }
  });
}

export { putStoreRelations, getStoreRelation }