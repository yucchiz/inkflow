import { createContext, useContext, type ReactNode } from 'react'
import type { DocumentRepository } from '../data/DocumentRepository'

const RepositoryContext = createContext<DocumentRepository | null>(null)

export function RepositoryProvider({ repository, children }: { repository: DocumentRepository; children: ReactNode }) {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>
}

export function useRepository(): DocumentRepository {
  const ctx = useContext(RepositoryContext)
  if (!ctx) throw new Error('useRepository must be used within RepositoryProvider')
  return ctx
}
