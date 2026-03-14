import { openDB, type IDBPDatabase } from 'idb';

import type { Document, DocumentRepository } from '@/types/document';

interface InkFlowDB {
  documents: {
    key: string;
    value: Document;
    indexes: { updatedAt: string };
  };
}

let dbPromise: Promise<IDBPDatabase<InkFlowDB>> | null = null;

function getDB(): Promise<IDBPDatabase<InkFlowDB>> {
  if (!dbPromise) {
    dbPromise = openDB<InkFlowDB>('inkflow', 1, {
      upgrade(db) {
        const store = db.createObjectStore('documents', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      },
    });
  }
  return dbPromise;
}

export function resetDB(): void {
  dbPromise = null;
}

export const documentRepository: DocumentRepository = {
  async getAll(): Promise<Document[]> {
    try {
      const db = await getDB();
      const docs = await db.getAllFromIndex('documents', 'updatedAt');
      return docs.reverse();
    } catch (error) {
      console.error('[DocumentRepository] ドキュメント一覧の取得に失敗:', {
        error,
      });
      throw error;
    }
  },

  async getById(id: string): Promise<Document | undefined> {
    try {
      const db = await getDB();
      return await db.get('documents', id);
    } catch (error) {
      console.error('[DocumentRepository] ドキュメントの取得に失敗:', {
        id,
        error,
      });
      throw error;
    }
  },

  async save(doc: Document): Promise<void> {
    try {
      const db = await getDB();
      await db.put('documents', doc);
    } catch (error) {
      console.error('[DocumentRepository] ドキュメントの保存に失敗:', {
        id: doc.id,
        error,
      });
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete('documents', id);
    } catch (error) {
      console.error('[DocumentRepository] ドキュメントの削除に失敗:', {
        id,
        error,
      });
      throw error;
    }
  },
};
