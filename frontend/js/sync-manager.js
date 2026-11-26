const apiUrl = path => `${window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "")}${path}`;
let syncing = false;
let lastServerSync = 0;

async function apiRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (response.status === 409) {
    const detail = await response.json().catch(() => ({}));
    const error = new Error(detail.message || "Conflicto de versión.");
    error.conflict = true;
    throw error;
  }
  if (!response.ok && response.status !== 204) {
    const detail = await response.text().catch(() => "");
    throw new Error(`API ${response.status}: ${detail || response.statusText}`);
  }
  return response.status === 204 ? null : response.json();
}

async function refreshFromServer() {
  const serverItems = await apiRequest("/api/garments/");
  const queue = await queueGetAll();
  const pendingIds = new Set(queue.filter(x => x.id).map(x => x.id));
  const localItems = await localGetAll();
  const serverIds = new Set(serverItems.map(x => x.id));

  // Actualiza documentos del servidor, pero no pisa cambios locales pendientes.
  for (const item of serverItems) {
    if (!pendingIds.has(item.id)) await localPut({ ...item, pending: false, conflict: false });
  }
  // Retira del dispositivo elementos que ya no existen en servidor, salvo los pendientes.
  for (const item of localItems) {
    if (!String(item.id).startsWith("local-") && !serverIds.has(item.id) && !pendingIds.has(item.id))
      await localDelete(item.id);
  }
  lastServerSync = Date.now();
  return serverItems;
}

async function syncPending() {
  if (syncing || !navigator.onLine) return;
  syncing = true;
  setSyncMessage("Sincronizando con Render y Firestore…");
  try {
    let queue = await queueGetAll();
    for (const op of queue) {
      try {
        if (op.conflict) continue;
        if (op.type === "create") {
          const created = await apiRequest("/api/garments/", { method: "POST", body: JSON.stringify(op.data) });
          await localDelete(op.localId);
          await localPut({ ...created, pending: false });
          await queueRemove(op.opId);
        } else if (op.type === "update") {
          const updated = await apiRequest(`/api/garments/${encodeURIComponent(op.id)}`, {
            method: "PUT", body: JSON.stringify({ ...op.data, baseVersion: op.baseVersion })
          });
          await localPut({ ...updated, pending: false });
          await queueRemove(op.opId);
        } else if (op.type === "delete") {
          await apiRequest(`/api/garments/${encodeURIComponent(op.id)}?baseVersion=${op.baseVersion}`, { method: "DELETE" });
          await localDelete(op.id);
          await queueRemove(op.opId);
        }
      } catch (error) {
        if (error.conflict) {
          op.conflict = true;
          op.error = error.message;
          await queuePut(op);
          const local = await localGet(op.id);
          if (local) await localPut({ ...local, conflict: true, pending: true });
          setSyncMessage(`Conflicto en ${op.id}: ${error.message}. El cambio local se conserva para revisión.`);
          continue;
        }
        throw error;
      }
    }
    await refreshFromServer();
    const remaining = await queueGetAll();
    setSyncMessage(remaining.length
      ? `${remaining.length} operación(es) pendiente(s). Revisa los conflictos si aparecen.`
      : "Sincronización completada. API Render y Firestore están actualizados.");
  } catch (error) {
    setSyncMessage(`No se pudo sincronizar: ${error.message}`);
  } finally {
    syncing = false;
    if (window.renderItems) await window.renderItems();
  }
}

function setSyncMessage(message) {
  const el = document.getElementById("sync-status");
  if (el) el.textContent = message;
}
window.syncPending = syncPending;
window.refreshFromServer = refreshFromServer;
window.setSyncMessage = setSyncMessage;
window.addEventListener("online", syncPending);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") syncPending();
});
// Sondeo periódico: mantiene otros dispositivos actualizados sin depender de Background Sync.
setInterval(async () => {
  if (navigator.onLine && !syncing && Date.now() - lastServerSync >= window.APP_CONFIG.SYNC_INTERVAL_MS) {
    try { await refreshFromServer(); if (window.renderItems) await window.renderItems(); }
    catch (error) { setSyncMessage(`API no disponible: ${error.message}`); }
  }
}, 5000);
