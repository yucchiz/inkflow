import type { Document } from '@/types/document';

export function createDocument(overrides?: Partial<Document>): Document {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: '',
    body: '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
