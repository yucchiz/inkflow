export interface Document {
  id: string;
  title: string;
  body: string;
  /** ISO 8601 形式 */
  createdAt: string;
  /** ISO 8601 形式 */
  updatedAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
}

export interface DocumentRepository {
  getAll(): Promise<Document[]>;
  getById(id: string): Promise<Document | undefined>;
  save(doc: Document): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface DocumentState {
  documents: Document[];
  isLoading: boolean;
}

export type DocumentAction =
  | { type: 'LOAD_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: { id: string } };

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
