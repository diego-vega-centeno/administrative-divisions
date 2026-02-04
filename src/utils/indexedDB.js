import { debugLog, errorLog } from "./logger";

// databse config
const DB_NAME = 'osm-cache';
const DB_VERSION = 1;
const STORE_NAME = 'relations';

const MAX_AGE_DAYS = 7; // days
const MAX_OBJECTS_COUNT = 50;
const MAX_TOTAL_SIZE = 100; // MB
const MS_PER_DAY = 24 * 60 * 60 * 1000

//* initialize database

let dbPromise;

if (!('indexedDB' in window)) {
  debugLog("Your browser doesn't support IndexedDB.");
}

function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      dbPromise = null;
      errorLog(`Database error: ${event.target.errorCode}`);
      reject(event.target);
    }

    request.onsuccess = (event) => {
      const db = request.result;
      debugLog(`Database openend successfully: ${JSON.stringify(db.objectStoreNames)}`);
      resolve(db);
    }

    // triggered when higher version is used in open() than the one used previously 
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      let store;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      } else {
        store = event.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }

      if (!store.indexNames.contains('storedAtIndex')) {
        store.createIndex('storedAtIndex', 'storedAt');
      }
    }

  });

  return dbPromise;
}


//* create transaction utility

// function makeTransaction(storeName, type) {
//   const transaction = db.transaction(storeName, type)
//   transaction.oncomplete = (event) => {
//     debugLog('Transaction successful');
//   }
//   transaction.onerror = (event) => {
//     event.stopPropagation();
//     errorLog(`There was an error: ${event.message}`);
//   }

//   const store = transaction.objectStore(storeName);
//   return store;
// }

//* read/write functions

async function putStoreRelations(relations) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  tx.oncomplete = (event) => {
    debugLog(`Transaction successful: ${relations.length} relations stored`);
  }

  relations.forEach(rel => {

    // add stored time
    const request = store.put({ ...rel, storedAt: Date.now() });

    // add stored time and size
    // const request = store.put({ ...rel, storedAt: Date.now(), size: (new Blob([JSON.stringify(rel)]).size)});

    request.onerror = () => {
      errorLog(`Error while adding relation: ${request.error}`);
    }
  });
}

async function getStoreRelation(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
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


async function getAllStoredRelations() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
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

async function clearAllStoredRelations() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
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

async function cleanDBCache() {
  // clearAllStoredRelations();
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const countReq = store.count();
  let ageDeleteCount = 0, objectsDeletedCount = 0, sizeDeleteCount = 0;

  countReq.onsuccess = () => {
    debugLog(`IndexedDB: object count: ${countReq.result}`);
    // skip based on object counts
    if (countReq.result <= MAX_OBJECTS_COUNT) {
      debugLog(`IndexedDB: no cleanup needed`);
      tx.abort();
      return;
    }

    // clean up needed
    debugLog(`IndexedDB: doing cache clean up ...`);

    // clean based on count
    // let it try to delete already delete realtions 
    // because is faster than filtering
    cleanDBCacheObjectsCount(store)
      .then(count => {
        objectsDeletedCount = count;
      })
      .catch(err => errorLog(err));

    // clean based on age, LRU object
    cleanDBCacheMaxAge(store)
      .then(count => {
        ageDeleteCount = count;
      })
      .catch(err => errorLog(err));

    // clean based on total size
    // cleanDBCacheTotalSize(store)
    //   .then(count => {
    //     ageDeleteCount = count;
    //   })
    //   .catch(err => errorLog(err));
  }

  tx.onerror = () => {
    errorLog(tx.error);
  };

  tx.oncomplete = () => {
    if (ageDeleteCount > 0) debugLog(`IndexedDB: cleanup done MAX_AGE_DAYS: ${ageDeleteCount} deleted`);
    if (objectsDeletedCount > 0) debugLog(`IndexedDB: cleanup done MAX_OBJECTS_COUNT: ${objectsDeletedCount} deleted`);
    if (sizeDeleteCount > 0) debugLog(`IndexedDB: cleanup done MAX_TOTAL_SIZE: ${sizeDeleteCount} deleted`);
  };
}

function cleanDBCacheMaxAge(store) {

  return new Promise((resolve, reject) => {

    const cutoff = Date.now() - MAX_AGE_DAYS * MS_PER_DAY;
    const range = IDBKeyRange.upperBound(cutoff);
    const index = store.index("storedAtIndex");
    const request = index.openCursor(range);
    let count = 0;

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (!cursor) {
        resolve(count);
        return;
      };
      count++;
      cursor.delete();
      cursor.continue();
    }

    request.onerror = () => reject(request.error);
  })
}

function cleanDBCacheObjectsCount(store) {

  return new Promise((resolve, reject) => {
    const index = store.index("storedAtIndex");
    // make cursor at index iterating from newest to oldest
    const request = index.openCursor(null, 'prev');

    let seen = 0;
    let deleted = 0;
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (!cursor) {
        resolve(deleted);
        return;
      };

      seen++;
      if (seen > MAX_OBJECTS_COUNT) {
        cursor.delete();
        deleted++;
      }

      cursor.continue();
    }

    request.onerror = () => reject(request.error);
  });
}

function cleanDBCacheTotalSize(store) {

  return new Promise((resolve, reject) => {

    let totalSize = 0;
    const request = store.getAll();

    request.onsuccess = (e) => {
      const rels = e.target.result;
      const relsWithSize = rels.map(rel => {
        const size = new Blob([JSON.stringify(rel)]).size / (1024 * 1024); // Convert to MB
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

      resolve(count);
    }

    request.onerror = () => reject(request.error);
  })
}

export {
  putStoreRelations, getStoreRelation, getAllStoredRelations,
  clearAllStoredRelations, cleanDBCache, initDB
}