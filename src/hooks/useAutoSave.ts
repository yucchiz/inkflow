import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/hooks/useToast';

import type { Document } from '@/types/document';

const DEBOUNCE_DELAY = 500;
const SAVED_DISPLAY_DURATION = 2000;

type SaveStatus = 'idle' | 'saving' | 'saved';

type UseAutoSaveReturn = {
  title: string;
  body: string;
  setTitle: (title: string) => void;
  setBody: (body: string) => void;
  saveStatus: SaveStatus;
};

function clearTimer(ref: React.RefObject<ReturnType<typeof setTimeout> | null>) {
  if (ref.current !== null) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

export function useAutoSave(
  document: Document | null,
  updateDocument: (doc: Document) => Promise<void>
): UseAutoSaveReturn {
  const { showToast } = useToast();

  const [trackedDocId, setTrackedDocId] = useState(document?.id);
  const [title, setTitleState] = useState(document?.title ?? '');
  const [body, setBodyState] = useState(document?.body ?? '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const titleRef = useRef(title);
  const bodyRef = useRef(body);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingChangesRef = useRef(false);
  const documentRef = useRef(document);
  const updateDocumentRef = useRef(updateDocument);

  // Reset state when document id changes (render-time state adjustment)
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (trackedDocId !== document?.id) {
    setTrackedDocId(document?.id);
    setTitleState(document?.title ?? '');
    setBodyState(document?.body ?? '');
  }

  useEffect(() => {
    titleRef.current = title;
    bodyRef.current = body;
  });

  useEffect(() => {
    documentRef.current = document;
  }, [document]);

  useEffect(() => {
    updateDocumentRef.current = updateDocument;
  }, [updateDocument]);

  // Clear timers and pending flag when document id changes
  useEffect(() => {
    hasPendingChangesRef.current = false;
    clearTimer(debounceTimerRef);
  }, [trackedDocId]);

  const performSave = useCallback(async () => {
    const doc = documentRef.current;
    if (!doc) return;

    setSaveStatus('saving');
    hasPendingChangesRef.current = false;

    try {
      await updateDocumentRef.current({
        ...doc,
        title: titleRef.current,
        body: bodyRef.current,
        updatedAt: new Date().toISOString(),
      });

      setSaveStatus('saved');

      clearTimer(savedTimerRef);
      savedTimerRef.current = setTimeout(() => {
        setSaveStatus('idle');
        savedTimerRef.current = null;
      }, SAVED_DISPLAY_DURATION);
    } catch {
      showToast('保存に失敗しました');
      setSaveStatus('idle');
    }
  }, [showToast]);

  const scheduleSave = useCallback(() => {
    hasPendingChangesRef.current = true;
    clearTimer(debounceTimerRef);

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      performSave();
    }, DEBOUNCE_DELAY);
  }, [performSave]);

  const setTitle = useCallback(
    (newTitle: string) => {
      setTitleState(newTitle);
      titleRef.current = newTitle;
      scheduleSave();
    },
    [scheduleSave]
  );

  const setBody = useCallback(
    (newBody: string) => {
      setBodyState(newBody);
      bodyRef.current = newBody;
      scheduleSave();
    },
    [scheduleSave]
  );

  // Flush pending changes on unmount
  useEffect(() => {
    return () => {
      clearTimer(debounceTimerRef);
      clearTimer(savedTimerRef);

      if (hasPendingChangesRef.current && documentRef.current) {
        updateDocumentRef
          .current({
            ...documentRef.current,
            title: titleRef.current,
            body: bodyRef.current,
            updatedAt: new Date().toISOString(),
          })
          .catch(() => {});
      }
    };
  }, []);

  return { title, body, setTitle, setBody, saveStatus };
}
