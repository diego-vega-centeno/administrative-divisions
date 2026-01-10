import { event } from "jquery";

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

function putStoreRelations(relations) {
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  transaction.oncomplete = (event) => {
    console.log('Transaction successful');
  }
  transaction.onerror = (event) => {
    event.stopPropagation();
    console.log(`There was an error: ${event.message}`);
  }

  const store = transaction.objectStore(STORE_NAME);

  relations.forEach(rel => {
    const request = store.put(rel);
    request.onsuccess = () => {
      console.log(`Relation added: ${request.result}`);
    };

    request.onerror = () => {
      console.log(`Error when adding relation: ${request.error}`);
    }
  });
}

// function getStoreRelation()

export default db;

export { putStoreRelations }