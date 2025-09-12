const DB_NAME = 'LuckyDrawDB';
const DB_VERSION = 1;
const STORE = 'state';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function setItem(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function getItem(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function toPlain(obj){
    try {
        // Prefer structuredClone when available (keeps types), fallback to JSON deep copy
        if (typeof structuredClone === 'function') return structuredClone(obj);
    } catch (e) {}
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return obj; }
}

export async function saveAll(state) {
    const payload = {
        prizes: toPlain(state.prizes || []),
        participants: toPlain(state.participants || []),
        currentPrizeId: state.currentPrizeId || null,
    };
    await setItem('state', payload);
}

export async function loadAll() {
    const payload = await getItem('state');
    return payload || { prizes: [], participants: [], currentPrizeId: null };
}

export async function clearAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

export default { saveAll, loadAll, clearAll };
