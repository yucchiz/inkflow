import { DocumentIcon } from '@heroicons/react/24/outline';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-(--color-text-sub)">
      <DocumentIcon aria-hidden="true" className="h-12 w-12" />
      <p className="mt-4 text-lg">まだドキュメントがありません</p>
      <p className="mt-2 text-sm">＋ボタンで書き始めましょう</p>
    </div>
  );
}
