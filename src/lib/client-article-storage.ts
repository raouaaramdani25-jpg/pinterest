import { Article } from '@/types';

const DATABASE_NAME = 'cozyspace-automation';
const STORE_NAME = 'articles';
const DATABASE_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open browser article storage.'));
  });
}

export async function saveClientArticle(article: Article): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(article);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Could not save article in browser storage.'));
  });
  database.close();
}

export async function getClientArticles(): Promise<Article[]> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return [];
  const database = await openDatabase();
  const articles = await new Promise<Article[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as Article[]);
    request.onerror = () => reject(request.error || new Error('Could not read browser article storage.'));
  });
  database.close();
  return articles.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
