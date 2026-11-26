const DB_NAME = "gestion-ropa-local";
const DB_VERSION = 1;

function openLocalDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("garments")) db.createObjectStore("garments", { keyPath: "id" });
      if (!db.objectStoreNames.contains("queue")) {
        const queue = db.createObjectStore("queue", { keyPath: "opId" });
        queue.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(storeName, mode, callback) {
  const db = await openLocalDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;
    try { result = callback(store); } catch (error) { reject(error); return; }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function localGetAll() {
  const db = await openLocalDb();
  const tx = db.transaction("garments", "readonly");
  const rows = await requestResult(tx.objectStore("garments").getAll());
  return rows.filter(item => !item.deleted);
}
async function localGet(id) {
  const db = await openLocalDb();
  const tx = db.transaction("garments", "readonly");
  return requestResult(tx.objectStore("garments").get(id));
}
async function localPut(item) { return withStore("garments", "readwrite", s => s.put(item)); }
async function localDelete(id) { return withStore("garments", "readwrite", s => s.delete(id)); }
async function queuePut(operation) { return withStore("queue", "readwrite", s => s.put(operation)); }
async function queueGetAll() {
  const db = await openLocalDb();
  const tx = db.transaction("queue", "readonly");
  const rows = await requestResult(tx.objectStore("queue").getAll());
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
async function queueRemove(opId) { return withStore("queue", "readwrite", s => s.delete(opId)); }
async function queueFindByLocalId(localId) {
  return (await queueGetAll()).find(op => op.type === "create" && op.localId === localId);
}
async function queueFindByRecord(id) {
  return (await queueGetAll()).find(op => op.id === id && op.type === "update");
}
