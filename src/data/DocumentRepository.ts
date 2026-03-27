import type { InkDocument } from '../models/InkDocument'

export interface DocumentRepository {
  getAll(): Promise<InkDocument[]>
  getById(id: string): Promise<InkDocument | null>
  save(document: InkDocument): Promise<void>
  remove(id: string): Promise<void>
}
