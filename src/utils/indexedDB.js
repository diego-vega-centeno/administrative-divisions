import logger from './logger';

// databse config
const DB_NAME = 'osm-cache';
const DB_VERSION = 1;
const STORE_NAME = 'relations';

const isMobile = isDeviceMobile();

const MAX_AGE_DAYS = 7; // days
const MAX_OBJECTS_COUNT = isMobile ? 100 : 200;
const MAX_TOTAL_SIZE = isMobile ? 50 : 100; // MB
const MS_PER_DAY = 24 * 60 * 60 * 1000

function isDeviceMobile() {
  let isMobile = false;

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  }

  if (!isMobile) {
    isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  }

  return isMobile;
}

//* initialize database

let dbPromise;

if (!('indexedDB' in window)) {
  logger.info("Your browser doesn't support IndexedDB.");
}

function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      dbPromise = null;
      logger.info(`Database error: ${event.target.errorCode}`);
      reject(event.target);
    }

    request.onsuccess = (event) => {
      const db = request.result;
      logger.info(`Database openend successfully: ${JSON.stringify(db.objectStoreNames)}`);
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
//     logger.info('Transaction successful');
//   }
//   transaction.onerror = (event) => {
//     event.stopPropagation();
//     logger.error(`There was an error: ${event.message}`);
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
    logger.info(`IndexedDB: Transaction successful: ${relations.length} relations stored`);
  }

  relations.forEach(rel => {

    // add stored time
    const request = store.put({ ...rel, storedAt: Date.now() });

    // add stored time and size
    // const request = store.put({ ...rel, storedAt: Date.now(), size: (new Blob([JSON.stringify(rel)]).size)});

    request.onerror = () => {
      logger.error(`Error while adding relation: ${request.error}`);
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
        logger.info(`IndexedDB: Relation obtained: id = ${request.result.id}`);
      }
      // storedAt for internal indexedDB management
      if(request.result) delete request.result.storedAt;
      
      resolve(request.result);
    };

    request.onerror = () => {
      logger.error(`IndexedDB: Error while getting relation: ${request.error}`);
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
      logger.info(`IndexedDB: All stored relations: ${request.result.length} items`);
      console.table(request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      logger.error(`IndexedDB: Error getting all relations: ${request.error}`);
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
      logger.info('IndexedDB: All stored relations cleared');
      resolve();
    };

    request.onerror = () => {
      logger.error(`IndexedDB: Error clearing relations: ${request.error}`);
      reject(request.error);
    }
  });
}

//* Clean database cache

async function cleanDBCache() {
  // clearAllStoredRelations();
  const db = await initDB();
  const estimate = await navigator.storage.estimate();

  const usage = estimate.usage / 1_000_000; // MB
  const quota = estimate.quota / 1_000_000; // MB

  // compare with indexedDB caps
  logger.info(`IndexedDB: storage quota: ${quota} (MB); cap: ${MAX_TOTAL_SIZE} (MB)`);
  logger.info(`IndexedDB: storage usage: ${usage} (MB); `);

  if (usage > MAX_TOTAL_SIZE) {
    try {
      await cleanDBCacheLRU(db, usage);
    } catch (error) {
      logger.error(error)
    }
  }
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

async function cleanDBCacheLRU(db, usage) {
  let currentUsage = usage;
  let deleted = 0;
  const threshold = (MAX_TOTAL_SIZE) * (80 / 100);

  while (currentUsage > threshold) {
    const batchDeleted = await deleteBatch(db, 10);
    if (batchDeleted === 0) break;
    deleted += batchDeleted;

    const estimate = await navigator.storage.estimate();
    currentUsage = estimate.usage / 1_000_000;
  }

  if (deleted > 0) logger.info(`IndexedDB: cleanup done LRU: ${deleted} deleted`);
}

function deleteBatch(db, size) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    // make cursor at index iterating from oldest to newest
    const index = store.index("storedAtIndex");
    let deleted = 0;

    index.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;

      if (!cursor || deleted >= size) return;

      cursor.delete();
      deleted++;

      cursor.continue();
    }

    tx.oncomplete = () => resolve(deleted);
    tx.onerror = () => reject(tx.error);
  })
}

function cleanDBCacheObjectsCount(db) {

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

export {
  putStoreRelations, getStoreRelation, getAllStoredRelations,
  clearAllStoredRelations, cleanDBCache, initDB
}