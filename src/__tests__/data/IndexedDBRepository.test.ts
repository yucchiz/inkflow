import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { IndexedDBRepository } from '../../data/IndexedDBRepository'
import type { InkDocument } from '../../models/InkDocument'

let repo: IndexedDBRepository
let testDbCounter = 0

function createTestDoc(overrides: Partial<InkDocument> = {}): InkDocument {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: 'Test Title',
    body: 'Test Body',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

beforeEach(() => {
  testDbCounter++
  repo = new IndexedDBRepository(`inkflow-test-${testDbCounter}`)
})

describe('IndexedDBRepository', () => {
  it('save and retrieve a document', async () => {
    const doc = createTestDoc({ title: 'Hello', body: 'World' })
    await repo.save(doc)

    const retrieved = await repo.getById(doc.id)
    expect(retrieved).toEqual(doc)
  })

  it('getAll returns documents sorted by updatedAt descending', async () => {
    const oldest = createTestDoc({ title: 'Oldest', updatedAt: 1000 })
    const middle = createTestDoc({ title: 'Middle', updatedAt: 2000 })
    const newest = createTestDoc({ title: 'Newest', updatedAt: 3000 })

    await repo.save(oldest)
    await repo.save(newest)
    await repo.save(middle)

    const all = await repo.getAll()
    expect(all).toHaveLength(3)
    expect(all[0]!.title).toBe('Newest')
    expect(all[1]!.title).toBe('Middle')
    expect(all[2]!.title).toBe('Oldest')
  })

  it('getById returns null for non-existent ID', async () => {
    const result = await repo.getById('non-existent-id')
    expect(result).toBeNull()
  })

  it('save with same ID updates (upsert behavior)', async () => {
    const doc = createTestDoc({ title: 'Original' })
    await repo.save(doc)

    const updated = { ...doc, title: 'Updated', updatedAt: doc.updatedAt + 1000 }
    await repo.save(updated)

    const retrieved = await repo.getById(doc.id)
    expect(retrieved).toEqual(updated)
    expect(retrieved!.title).toBe('Updated')

    const all = await repo.getAll()
    expect(all).toHaveLength(1)
  })

  it('remove deletes document', async () => {
    const doc = createTestDoc()
    await repo.save(doc)

    await repo.remove(doc.id)

    const retrieved = await repo.getById(doc.id)
    expect(retrieved).toBeNull()
  })

  it('remove does not throw for non-existent ID', async () => {
    await expect(repo.remove('non-existent-id')).resolves.toBeUndefined()
  })

  it('manages multiple documents', async () => {
    const docs = Array.from({ length: 5 }, (_, i) =>
      createTestDoc({ title: `Doc ${i}`, updatedAt: 1000 * (i + 1) })
    )

    for (const doc of docs) {
      await repo.save(doc)
    }

    const all = await repo.getAll()
    expect(all).toHaveLength(5)
    expect(all[0]!.title).toBe('Doc 4')
    expect(all[4]!.title).toBe('Doc 0')

    await repo.remove(docs[2]!.id)
    const afterRemove = await repo.getAll()
    expect(afterRemove).toHaveLength(4)
    expect(afterRemove.find(d => d.id === docs[2]!.id)).toBeUndefined()
  })
})
