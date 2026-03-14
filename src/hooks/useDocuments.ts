import { useContext } from 'react';

import { DocumentContext } from '@/contexts/DocumentContext';

import type { DocumentContextValue } from '@/contexts/DocumentContext';

export function useDocuments(): DocumentContextValue {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
