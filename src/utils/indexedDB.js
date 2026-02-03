import { debugLog, errorLog } from "./logger";

// databse config
const DB_NAME = 'osm-cache';
const DB_VERSION = 1;
const STORE_NAME = 'relations';

const MAX_AGE_DAYS = 7; // days
const MAX_OBJECTS_COUNT = 2;
const MAX_TOTAL_SIZE = 100; // MB
const MS_PER_DAY = 24 * 60 * 60 * 1000

//* initialize database
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

  // clean DB cache
  cleanDBCache()
}

// triggered when higher version is used in open() than the one used previously 
request.onupgradeneeded = (event) => {
  db = event.target.result;

  if (!db.objectStoreNames.contains(STORE_NAME)) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
  };
}


//* create transaction utility

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

//* read/write functions

function putStoreRelations(relations) {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  tx.oncomplete = (event) => {
    debugLog(`Transaction successful: ${relations.length} relations stored`);
  }

  relations.forEach(rel => {
    // add stored time
    rel.storedAt = Date.now();
    const request = store.put(rel);

    request.onerror = () => {
      errorLog(`Error while adding relation: ${request.error}`);
    }
  });
}

function getStoreRelation(id) {
  return new Promise((resolve, reject) => {
    const store = makeTransaction(STORE_NAME, 'readonly');
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        debugLog(`Relation obtained: id = ${request.result.id}`);
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
    const store = makeTransaction(STORE_NAME, 'readonly');
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
    const store = makeTransaction(STORE_NAME, 'readwrite');
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

//* Clean database cache

function cleanDBCache() {
  // clearAllStoredRelations();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const countReq = store.count();
  let ageCount = 0, objectsCount = 0, sizeCount = 0;

  countReq.onsuccess = () => {
    if (countReq.result <= MAX_OBJECTS_COUNT) {
      debugLog(`IndexedDB: object count: ${countReq.result}; No cleanup needed`);
      return;
    }

    const req = store.getAll();
    req.onsuccess = (e) => {
      const rels = e.target.result;
      debugLog(`IndexedDB: object count: ${rels.length}`);

      // clean based on age, LRU object
      // ageCount = cleanDBCacheMaxAge(rels, store);

      // clean based on count
      // let it try to delete already delete realtions 
      // because is faster than filtering
      // objectsCount = cleanDBCacheObjectsCount(rels, store);

      // clean base on total size
      sizeCount = cleanDBCacheTotalSize(rels, store);
    };
  }

  tx.onerror = () => {
    errorLog(tx.error);
  };

  tx.oncomplete = () => {
    if (ageCount > 0) debugLog(`IndexedDB: cleanup done MAX_AGE_DAYS: ${ageCount} deleted`);
    if (objectsCount > 0) debugLog(`IndexedDB: cleanup done MAX_OBJECTS_COUNT: ${objectsCount} deleted`);
    if (sizeCount > 0) debugLog(`IndexedDB: cleanup done MAX_TOTAL_SIZE: ${sizeCount} deleted`);
  };
}

function cleanDBCacheMaxAge(rels, store) {
  const maxAge = MAX_AGE_DAYS * MS_PER_DAY;
  const now = Date.now();
  let count = 0;
  for (const rel of rels) {
    if (!rel.storedAt || (now - rel.storedAt) > maxAge) {
      count++;
      store.delete(rel.id);
    }
  }
  return count;
}

function cleanDBCacheObjectsCount(rels, store) {

  if (rels.length <= MAX_OBJECTS_COUNT) return 0;

  const toDelete = rels.length - MAX_OBJECTS_COUNT;
  let count = 0;

  // from youngest to oldest
  rels.sort((a, b) => b.storedAt - a.storedAt);

  for (let i = 0; i < toDelete; i++) {
    store.delete(rels[MAX_OBJECTS_COUNT + i].id);
    count++;
  }
  return count;
}

function cleanDBCacheTotalSize(rels, store) {
  let totalSize = 0;
  const relsWithSize = rels.map(rel => {
    const size = new Blob([JSON.stringify(rel)]).size / (1024*1024); // Convert to MB
    totalSize += size;
    return { ...rel, size };
  });
  debugLog(`IndexedDB: current total size: ${totalSize} (MB)`)
  if (totalSize <= MAX_TOTAL_SIZE) return 0;

  // Sort from youngest to oldest (keep newest)
  relsWithSize.sort((a, b) => b.storedAt - a.storedAt);

  let count = 0;
  let currentSize = totalSize;

  // Delete oldest objects until we're under the size limit
  for (let i = relsWithSize.length - 1; i >= 0 && currentSize > MAX_TOTAL_SIZE; i--) {
    store.delete(relsWithSize[i].id);
    currentSize -= relsWithSize[i].size;
    count++;
  }

  return count;
}

export {
  putStoreRelations, getStoreRelation, getAllStoredRelations,
  clearAllStoredRelations, cleanDBCache
}