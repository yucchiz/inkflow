import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import Header from '@/components/common/Header';
import ThemeToggle from '@/components/common/ThemeToggle';
import DocumentList from '@/components/document-list/DocumentList';
import EmptyState from '@/components/document-list/EmptyState';
import Fab from '@/components/document-list/Fab';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/useToast';

function DocumentListPage() {
  const { state, deleteDocument } = useDocuments();
  const { showToast } = useToast();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (location.key !== 'default') {
      mainRef.current?.focus();
    }
  }, [location.key]);

  function handleDelete(id: string) {
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    if (deleteTarget) {
      try {
        await deleteDocument(deleteTarget);
      } catch {
        showToast('削除に失敗しました');
      }
      setDeleteTarget(null);
    }
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  const documents = state.documents;

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className="focus:outline-none motion-safe:animate-[page-in_var(--duration-normal)_var(--ease-out)]"
    >
      <Header>
        <h1 className="font-(family-name:--font-heading) text-lg font-bold tracking-[0.04em]">
          InkFlow
        </h1>
        <ThemeToggle />
      </Header>
      <section aria-label="ドキュメント一覧" className="mx-auto max-w-[640px] px-4 py-6">
        {state.isLoading ? (
          <p role="status" className="py-12 text-center text-sm text-(--color-text-sub)">
            読み込み中...
          </p>
        ) : documents.length === 0 ? (
          <EmptyState />
        ) : (
          <DocumentList documents={documents} onDelete={handleDelete} />
        )}
      </section>
      <Fab />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="ドキュメントの削除"
        message="このドキュメントを削除しますか？"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </main>
  );
}

export default DocumentListPage;
