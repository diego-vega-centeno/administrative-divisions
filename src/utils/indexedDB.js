import { debugLog, errorLog } from "./logger";

const DB_NAME = 'osm-cache';
const DB_VERSION = 1;
const STORE_NAME = 'relations';

let db;

if (!indexedDB) {
  debugLog("Your browser doesn't support IndexedDB.");
}

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = (event) => {
  errorLog(`Database error: ${event.target.errorCode}`);
}

request.onsuccess = (event) => {
  db = request.result;
  debugLog(`Database openend successfully: ${JSON.stringify(db.objectStoreNames)}`);

  // Clear cache on page load for session-only caching
  clearAllStoredRelations();
}

// triggered when higher version is used in open() than the one used previously 
request.onupgradeneeded = (event) => {
  db = event.target.result;

  if (!db.objectStoreNames.contains(STORE_NAME)) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
  };
}

function makeTransaction(storeName, type) {
  const transaction = db.transaction(storeName, type)
  transaction.oncomplete = (event) => {
    debugLog('Transaction successful');
  }
  transaction.onerror = (event) => {
    event.stopPropagation();
    errorLog(`There was an error: ${event.message}`);
  }

  const store = transaction.objectStore(storeName);
  return store;
}

function putStoreRelations(relations) {
  const store = makeTransaction(STORE_NAME, 'readWrite');

  relations.forEach(rel => {
    const request = store.put(rel);
    request.onsuccess = () => {
      // debugLog(`Object added id: ${request.result}`);
    };

    request.onerror = () => {
      errorLog(`Error while adding relation: ${request.error}`);
    }
  });
}

function getStoreRelation(id) {
  return new Promise((resolve, reject) => {
    const store = makeTransaction(STORE_NAME, 'read');
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        // debugLog(`Object obtained id: ${request.result.id}`);
      }
      resolve(request.result);
    };

    request.onerror = () => {
      errorLog(`Error while getting relation: ${request.error}`);
      reject(request.error);
    }
  });
}

function getAllStoredRelations() {
  return new Promise((resolve, reject) => {
    const store = makeTransaction(STORE_NAME, 'read');
    const request = store.getAll();

    request.onsuccess = () => {
      debugLog(`All stored relations: ${request.result.length} items`);
      console.table(request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      errorLog(`Error getting all relations: ${request.error}`);
      reject(request.error);
    }
  });
}

function clearAllStoredRelations() {
  return new Promise((resolve, reject) => {
    const store = makeTransaction(STORE_NAME, 'readWrite');
    const request = store.clear();

    request.onsuccess = () => {
      debugLog('All stored relations cleared');
      resolve();
    };

    request.onerror = () => {
      errorLog(`Error clearing relations: ${request.error}`);
      reject(request.error);
    }
  });
}

export { putStoreRelations, getStoreRelation, getAllStoredRelations, clearAllStoredRelations }