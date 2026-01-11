const DEBUG = process.env.NODE_ENV === 'development'

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

function errorLog(...args) {
  console.error(...args);
}

export { debugLog, errorLog }