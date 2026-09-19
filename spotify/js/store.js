/* IndexedDB: the two things worth keeping between visits.

   plays    — every stream the app has seen through /me/player/recently-played.
              Spotify only ever hands back the last 50, so polling and keeping
              them is the only way this history grows past that window.
   history  — rows from a Spotify data export, so a 100k-stream lifetime
              doesn't have to be re-imported on every visit. */
window.SP = window.SP || {};

SP.store = (function () {
  "use strict";

  var NAME = "spotify-stats";
  var VERSION = 1;
  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error("This browser has no IndexedDB, so nothing can be stored."));
        return;
      }
      var req = indexedDB.open(NAME, VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("plays")) {
          db.createObjectStore("plays", { keyPath: "ts" });
        }
        if (!db.objectStoreNames.contains("history")) {
          var hist = db.createObjectStore("history", { autoIncrement: true });
          hist.createIndex("ts", "ts");
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta");
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error("Could not open the local database.")); };
    });
    return dbPromise;
  }

  function tx(storeName, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var transaction = db.transaction(storeName, mode);
        var store = transaction.objectStore(storeName);
        var result;
        try { result = fn(store, transaction); } catch (err) { reject(err); return; }
        transaction.oncomplete = function () { resolve(result); };
        transaction.onerror = function () { reject(transaction.error); };
        transaction.onabort = function () { reject(transaction.error || new Error("Write aborted — the browser's storage quota may be full.")); };
      });
    });
  }

  function ask(req) {
    return new Promise(function (resolve, reject) {
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  /* ---- logged plays ---- */

  /* `ts` is the key, so a repeated poll overwrites rather than duplicates.
     Returns how many rows were new, which is what the UI reports. */
  function addPlays(records) {
    if (!records.length) return Promise.resolve(0);
    var tally = { added: 0 };
    return tx("plays", "readwrite", function (store) {
      records.forEach(function (record) {
        var get = store.get(record.ts);
        get.onsuccess = function () {
          if (get.result === undefined) tally.added++;
          store.put(record);
        };
      });
    }).then(function () { return tally.added; });
  }

  function allPlays() {
    return tx("plays", "readonly", function (store) {
      return ask(store.getAll());
    });
  }

  function countPlays() {
    return tx("plays", "readonly", function (store) {
      return ask(store.count());
    });
  }

  function clearPlays() {
    return tx("plays", "readwrite", function (store) { store.clear(); });
  }

  /* ---- imported history ---- */

  /* Written in chunks: one transaction per 5,000 rows keeps a 200k-stream
     export from holding a single transaction open long enough to time out,
     and gives the import bar something to report. */
  function addHistory(records, onProgress) {
    var CHUNK = 5000;
    var index = 0;

    function step() {
      if (index >= records.length) return Promise.resolve(records.length);
      var slice = records.slice(index, index + CHUNK);
      return tx("history", "readwrite", function (store) {
        slice.forEach(function (record) { store.add(record); });
      }).then(function () {
        index += slice.length;
        if (onProgress) onProgress(index, records.length);
        return step();
      });
    }
    return step();
  }

  function allHistory() {
    return tx("history", "readonly", function (store) {
      return ask(store.getAll());
    });
  }

  function countHistory() {
    return tx("history", "readonly", function (store) {
      return ask(store.count());
    });
  }

  function clearHistory() {
    return tx("history", "readwrite", function (store) { store.clear(); })
      .then(function () { return setMeta("import", null); });
  }

  /* ---- meta ---- */

  function getMeta(key) {
    return tx("meta", "readonly", function (store) {
      return ask(store.get(key));
    });
  }

  function setMeta(key, value) {
    return tx("meta", "readwrite", function (store) {
      if (value === null) store.delete(key);
      else store.put(value, key);
    });
  }

  function estimate() {
    if (!navigator.storage || !navigator.storage.estimate) return Promise.resolve(null);
    return navigator.storage.estimate().catch(function () { return null; });
  }

  return {
    addPlays: addPlays,
    allPlays: allPlays,
    countPlays: countPlays,
    clearPlays: clearPlays,
    addHistory: addHistory,
    allHistory: allHistory,
    countHistory: countHistory,
    clearHistory: clearHistory,
    getMeta: getMeta,
    setMeta: setMeta,
    estimate: estimate
  };
})();
