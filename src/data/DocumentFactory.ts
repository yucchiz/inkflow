import type { InkDocument } from '../models/InkDocument'

export function createDocument(title = '', body = ''): InkDocument {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title,
    body,
    createdAt: now,
    updatedAt: now,
  }
}
