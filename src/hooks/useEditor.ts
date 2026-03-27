import { useState, useEffect, useRef, useCallback } from 'react'
import { useRepository } from '@/contexts/RepositoryContext'
import type { InkDocument } from '@/models/InkDocument'
import { AUTO_SAVE_DEBOUNCE_MS, SAVED_STATUS_DURATION_MS } from '@/utils/constants'

export type SaveStatus = 'idle' | 'saving' | 'saved'

export function useEditor(documentId: string) {
  const repository = useRepository()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [createdAt, setCreatedAt] = useState(0)
  const [updatedAt, setUpdatedAt] = useState(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLoadingRef = useRef(true)
  const hasLoadedRef = useRef(false)
  const titleRef = useRef('')
  const bodyRef = useRef('')
  const createdAtRef = useRef(0)

  const characterCount = body.length

  // Keep refs in sync with state
  titleRef.current = title
  bodyRef.current = body
  createdAtRef.current = createdAt

  const save = useCallback(async () => {
    setSaveStatus('saving')
    try {
      const document: InkDocument = {
        id: documentId,
        title: titleRef.current,
        body: bodyRef.current,
        createdAt,
        updatedAt: Date.now(),
      }
      await repository.save(document)
      setSaveStatus('saved')

      if (statusTimerRef.current !== null) {
        clearTimeout(statusTimerRef.current)
      }
      statusTimerRef.current = setTimeout(() => {
        setSaveStatus('idle')
        statusTimerRef.current = null
      }, SAVED_STATUS_DURATION_MS)
    } catch (err) {
      console.error('[useEditor] save failed:', err)
      setSaveStatus('idle')
    }
  }, [documentId, createdAt, repository])

  const scheduleSave = useCallback(() => {
    if (isLoadingRef.current) return

    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      void save()
      saveTimerRef.current = null
    }, AUTO_SAVE_DEBOUNCE_MS)
  }, [save])

  // Load document on mount
  useEffect(() => {
    async function loadDocument() {
      try {
        const doc = await repository.getById(documentId)
        if (doc) {
          setTitle(doc.title)
          setBody(doc.body)
          setCreatedAt(doc.createdAt)
          setUpdatedAt(doc.updatedAt)
          titleRef.current = doc.title
          bodyRef.current = doc.body
        } else {
          setError(new Error('Document not found'))
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load document'))
      } finally {
        setIsLoading(false)
        isLoadingRef.current = false
        hasLoadedRef.current = true
      }
    }
    void loadDocument()
  }, [documentId, repository])

  // Auto-save effect: watch title and body changes after load
  useEffect(() => {
    if (!hasLoadedRef.current) return

    scheduleSave()

    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
    }
  }, [title, body, scheduleSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      if (statusTimerRef.current !== null) {
        clearTimeout(statusTimerRef.current)
        statusTimerRef.current = null
      }

      const currentTitle = titleRef.current
      const currentBody = bodyRef.current
      if (currentTitle.trim() === '' && currentBody.trim() === '') {
        repository.remove(documentId).catch((err) => {
          console.error('[useEditor] cleanup remove failed:', err)
        })
      } else {
        // Flush save
        const document: InkDocument = {
          id: documentId,
          title: currentTitle,
          body: currentBody,
          createdAt: createdAtRef.current || Date.now(),
          updatedAt: Date.now(),
        }
        repository.save(document).catch((err) => {
          console.error('[useEditor] cleanup save failed:', err)
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle)
  }, [])

  const updateBody = useCallback((newBody: string) => {
    setBody(newBody)
  }, [])

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      setShowControls(prev) // if was focus mode, show controls; if not, hide
      return !prev
    })
  }, [])

  const exitFocusMode = useCallback(() => {
    setIsFocusMode(false)
    setShowControls(true)
  }, [])

  const deleteDocument = useCallback(async () => {
    await repository.remove(documentId)
  }, [repository, documentId])

  return {
    title,
    body,
    createdAt,
    updatedAt,
    saveStatus,
    isFocusMode,
    showControls,
    isLoading,
    error,
    characterCount,
    updateTitle,
    updateBody,
    toggleFocusMode,
    exitFocusMode,
    deleteDocument,
    save,
  }
}
