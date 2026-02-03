import { openDB } from 'idb';

const DB_NAME = 'TaskSchedulerDB';
const STORE_NAME = 'tasks';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: '_id' });
  },
});

export const getTasksOffline = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const saveTasksOffline = async (tasks) => {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all([
    ...tasks.map(task => tx.store.put(task)),
    tx.done
  ]);
};

export const saveTaskOffline = async (task) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, task);
};
