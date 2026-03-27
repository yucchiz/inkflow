import type { InkDocument } from '../models/InkDocument'
import type { DocumentRepository } from './DocumentRepository'

export class MockDocumentRepository implements DocumentRepository {
  documents: InkDocument[] = []
  saveCallCount = 0
  removeCallCount = 0
  lastRemovedId: string | null = null
  shouldThrowOnSave = false
  shouldThrowOnGetAll = false
  shouldThrowOnGetById = false
  shouldThrowOnRemove = false

  async getAll(): Promise<InkDocument[]> {
    if (this.shouldThrowOnGetAll) throw new Error('getAll failed')
    return [...this.documents].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getById(id: string): Promise<InkDocument | null> {
    if (this.shouldThrowOnGetById) throw new Error('getById failed')
    return this.documents.find(d => d.id === id) ?? null
  }

  async save(document: InkDocument): Promise<void> {
    if (this.shouldThrowOnSave) throw new Error('save failed')
    this.saveCallCount++
    const index = this.documents.findIndex(d => d.id === document.id)
    if (index >= 0) {
      this.documents[index] = document
    } else {
      this.documents.push(document)
    }
  }

  async remove(id: string): Promise<void> {
    if (this.shouldThrowOnRemove) throw new Error('remove failed')
    this.removeCallCount++
    this.lastRemovedId = id
    this.documents = this.documents.filter(d => d.id !== id)
  }
}
