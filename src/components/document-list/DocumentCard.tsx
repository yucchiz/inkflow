import { Link } from 'react-router';
import { TrashIcon } from '@heroicons/react/24/outline';

import { formatDate } from '@/lib/formatDate';

import type { Document } from '@/types/document';

type Props = {
  doc: Document;
  onDelete: (id: string) => void;
};

export default function DocumentCard({ doc, onDelete }: Props) {
  const title = doc.title || '無題のドキュメント';

  return (
    <article className="group relative">
      <Link
        to={`/doc/${doc.id}`}
        className="block rounded-lg border border-(--color-border) bg-(--color-bg-sub) p-4 duration-[200ms] hover:bg-(--color-bg) focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:outline-none motion-safe:transition-colors"
      >
        <h3 className="truncate pr-8 font-(family-name:--font-heading) font-bold tracking-[0.04em] text-(--color-text)">
          {title}
        </h3>
        {doc.body && (
          <p className="mt-1 line-clamp-2 text-sm text-(--color-text-sub)">{doc.body}</p>
        )}
        <time
          dateTime={doc.updatedAt}
          className="mt-2 block text-right text-xs text-(--color-text-sub)"
        >
          {formatDate(doc.updatedAt)}
        </time>
      </Link>
      <button
        type="button"
        aria-label={`${title}を削除`}
        onClick={() => onDelete(doc.id)}
        className="absolute top-3 right-3 shrink-0 cursor-pointer rounded p-1 text-(--color-text-sub) duration-[var(--duration-fast)] hover:text-(--color-danger) focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:outline-none motion-safe:transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </article>
  );
}
