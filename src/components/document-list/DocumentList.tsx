import DocumentCard from '@/components/document-list/DocumentCard';

import type { Document } from '@/types/document';

type Props = {
  documents: Document[];
  onDelete: (id: string) => void;
};

export default function DocumentList({ documents, onDelete }: Props) {
  return (
    <ul className="flex list-none flex-col gap-2" aria-label="ドキュメント一覧">
      {documents.map((doc, index) => (
        <li
          key={doc.id}
          className="motion-safe:animate-[card-in_300ms_var(--ease-out)_both]"
          style={index < 10 ? { animationDelay: `${index * 50}ms` } : undefined}
        >
          <DocumentCard doc={doc} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
