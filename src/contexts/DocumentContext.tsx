import { createContext, useEffect, useReducer } from 'react';

import { documentRepository } from '@/lib/db';

import type { Document, DocumentAction, DocumentState } from '@/types/document';

export interface DocumentContextValue {
  state: DocumentState;
  loadDocuments: () => Promise<void>;
  addDocument: (doc: Document) => Promise<void>;
  updateDocument: (doc: Document) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const DocumentContext = createContext<DocumentContextValue | null>(null);

const initialState: DocumentState = {
  documents: [],
  isLoading: true,
};

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'LOAD_DOCUMENTS':
      return { documents: action.payload, isLoading: false };

    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [action.payload, ...state.documents],
      };

    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents
          .map((doc) => (doc.id === action.payload.id ? action.payload : doc))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      };

    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload.id),
      };
  }
}

type Props = { children: React.ReactNode };

function DocumentProvider({ children }: Props) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  async function loadDocuments(): Promise<void> {
    try {
      const docs = await documentRepository.getAll();
      dispatch({ type: 'LOAD_DOCUMENTS', payload: docs });
    } catch (error) {
      console.error('[DocumentContext] ドキュメント一覧の読み込みに失敗:', {
        error,
      });
      throw error;
    }
  }

  async function addDocument(doc: Document): Promise<void> {
    try {
      await documentRepository.save(doc);
      dispatch({ type: 'ADD_DOCUMENT', payload: doc });
    } catch (error) {
      console.error('[DocumentContext] ドキュメントの追加に失敗:', {
        id: doc.id,
        error,
      });
      throw error;
    }
  }

  async function updateDocument(doc: Document): Promise<void> {
    try {
      await documentRepository.save(doc);
      dispatch({ type: 'UPDATE_DOCUMENT', payload: doc });
    } catch (error) {
      console.error('[DocumentContext] ドキュメントの更新に失敗:', {
        id: doc.id,
        error,
      });
      throw error;
    }
  }

  async function deleteDocument(id: string): Promise<void> {
    try {
      await documentRepository.remove(id);
      dispatch({ type: 'DELETE_DOCUMENT', payload: { id } });
    } catch (error) {
      console.error('[DocumentContext] ドキュメントの削除に失敗:', {
        id,
        error,
      });
      throw error;
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <DocumentContext.Provider
      value={{ state, loadDocuments, addDocument, updateDocument, deleteDocument }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export default DocumentProvider;
