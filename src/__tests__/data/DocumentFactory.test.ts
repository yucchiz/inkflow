import { describe, it, expect } from 'vitest'
import { createDocument } from '../../data/DocumentFactory'

describe('createDocument', () => {
  it('creates document with default empty title and body', () => {
    const doc = createDocument()
    expect(doc.title).toBe('')
    expect(doc.body).toBe('')
    expect(doc.id).toBeTruthy()
  })

  it('creates document with custom title and body', () => {
    const doc = createDocument('My Title', 'My Body')
    expect(doc.title).toBe('My Title')
    expect(doc.body).toBe('My Body')
  })

  it('generates unique IDs', () => {
    const doc1 = createDocument()
    const doc2 = createDocument()
    expect(doc1.id).not.toBe(doc2.id)
  })

  it('sets createdAt and updatedAt to the same value close to Date.now()', () => {
    const before = Date.now()
    const doc = createDocument()
    const after = Date.now()

    expect(doc.createdAt).toBe(doc.updatedAt)
    expect(doc.createdAt).toBeGreaterThanOrEqual(before)
    expect(doc.createdAt).toBeLessThanOrEqual(after)
  })
})
