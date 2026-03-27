import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import type { InkDocument } from '../models/InkDocument'
import type { DocumentRepository } from './DocumentRepository'

interface InkFlowDB extends DBSchema {
  documents: {
    key: string
    value: InkDocument
    indexes: { 'by-updatedAt': number }
  }
}

export class IndexedDBRepository implements DocumentRepository {
  private db: IDBPDatabase<InkFlowDB> | null = null
  private readonly dbName: string

  constructor(dbName = 'inkflow-db') {
    this.dbName = dbName
  }

  private async getDB(): Promise<IDBPDatabase<InkFlowDB>> {
    if (!this.db) {
      try {
        this.db = await openDB<InkFlowDB>(this.dbName, 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('documents')) {
              const store = db.createObjectStore('documents', { keyPath: 'id' })
              store.createIndex('by-updatedAt', 'updatedAt')
            }
          },
        })
      } catch (err) {
        console.error('[IndexedDBRepository] Failed to open database:', err)
        throw err
      }
    }
    return this.db
  }

  async getAll(): Promise<InkDocument[]> {
    try {
      const db = await this.getDB()
      const docs = await db.getAllFromIndex('documents', 'by-updatedAt')
      return docs.reverse()
    } catch (err) {
      console.error('[IndexedDBRepository] getAll failed:', err)
      throw err
    }
  }

  async getById(id: string): Promise<InkDocument | null> {
    try {
      const db = await this.getDB()
      const doc = await db.get('documents', id)
      return doc ?? null
    } catch (err) {
      console.error('[IndexedDBRepository] getById failed:', { id }, err)
      throw err
    }
  }

  async save(document: InkDocument): Promise<void> {
    try {
      const db = await this.getDB()
      await db.put('documents', document)
    } catch (err) {
      console.error('[IndexedDBRepository] save failed:', { id: document.id }, err)
      throw err
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const db = await this.getDB()
      await db.delete('documents', id)
    } catch (err) {
      console.error('[IndexedDBRepository] remove failed:', { id }, err)
      throw err
    }
  }
}
