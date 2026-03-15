import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import BodyTextarea from '@/components/editor/BodyTextarea';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorMenu from '@/components/editor/EditorMenu';
import StatusBar from '@/components/editor/StatusBar';
import TitleInput from '@/components/editor/TitleInput';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDocuments } from '@/hooks/useDocuments';
import { useFocusMode } from '@/hooks/useFocusMode';
import { usePageTransition } from '@/hooks/usePageTransition';

function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isExiting, navigateWithTransition } = usePageTransition();
  const { state, updateDocument, deleteDocument } = useDocuments();

  const document = state.documents.find((doc) => doc.id === id) ?? null;
  const { title, body, setTitle, setBody, saveStatus } = useAutoSave(document, updateDocument);

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { isFocusMode, showControls, toggleFocusMode } = useFocusMode();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef(title);
  const bodyRef = useRef(body);

  useEffect(() => {
    titleRef.current = title;
    bodyRef.current = body;
  });

  // Redirect if id is missing or document not found after loading
  useEffect(() => {
    if (!id || (!state.isLoading && !document)) {
      navigate('/', { replace: true });
    }
  }, [id, state.isLoading, document, navigate]);

  const handleBack = useCallback(() => {
    if (id && titleRef.current.trim() === '' && bodyRef.current.trim() === '') {
      deleteDocument(id).catch(() => {});
    }
    navigateWithTransition('/');
  }, [id, deleteDocument, navigateWithTransition]);

  function handleFocusBody() {
    textareaRef.current?.focus();
  }

  function handleMenuToggle() {
    setMenuOpen((prev) => !prev);
  }

  function handleMenuClose() {
    setMenuOpen(false);
  }

  function handleDeleteRequest() {
    setDeleteDialogOpen(true);
  }

  function handleDeleteConfirm() {
    if (id) {
      deleteDocument(id).catch(() => {});
    }
    setDeleteDialogOpen(false);
    navigateWithTransition('/');
  }

  function handleDeleteCancel() {
    setDeleteDialogOpen(false);
  }

  function handleFocusMode() {
    toggleFocusMode();
  }

  // Auto-focus body textarea on mount (PRD §1.2)
  useEffect(() => {
    if (document && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [document?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.isLoading || !document) {
    return (
      <main>
        <p role="status" className="py-12 text-center text-sm text-(--color-text-sub)">
          読み込み中...
        </p>
      </main>
    );
  }

  return (
    <main
      className={
        isExiting
          ? 'pointer-events-none motion-safe:animate-[page-out_var(--duration-fast)_var(--ease-in)_forwards]'
          : 'motion-safe:animate-[page-in_var(--duration-normal)_var(--ease-out)]'
      }
    >
      <EditorHeader
        saveStatus={saveStatus}
        onBack={handleBack}
        onMenuToggle={handleMenuToggle}
        menuOpen={menuOpen}
        visible={!isFocusMode || showControls}
      >
        <EditorMenu
          open={menuOpen}
          onClose={handleMenuClose}
          title={title}
          body={body}
          onDelete={handleDeleteRequest}
          onFocusMode={handleFocusMode}
        />
      </EditorHeader>
      <article className="mx-auto max-w-[680px] px-4 pt-6 pb-24">
        <TitleInput value={title} onChange={setTitle} onFocusBody={handleFocusBody} />
        <div className="mt-4">
          <BodyTextarea value={body} onChange={setBody} textareaRef={textareaRef} />
        </div>
      </article>
      <StatusBar charCount={body.length} visible={!isFocusMode || showControls} />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="ドキュメントを削除"
        message="このドキュメントを削除しますか？この操作は取り消せません。"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </main>
  );
}

export default EditorPage;
