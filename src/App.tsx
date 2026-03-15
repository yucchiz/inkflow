import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import Toast from '@/components/common/Toast';
import UpdateNotification from '@/components/common/UpdateNotification';
import DocumentProvider from '@/contexts/DocumentContext';
import ThemeProvider from '@/contexts/ThemeContext';
import ToastProvider from '@/contexts/ToastContext';
import { useServiceWorker } from '@/hooks/useServiceWorker';

const DocumentListPage = lazy(() => import('@/pages/DocumentListPage'));
const EditorPage = lazy(() => import('@/pages/EditorPage'));

function App() {
  const { needRefresh, updateServiceWorker } = useServiceWorker();

  return (
    <DocumentProvider>
      <ThemeProvider>
        <ToastProvider>
          <Suspense
            fallback={
              <main>
                <p role="status" className="py-12 text-center text-sm text-(--color-text-sub)">
                  読み込み中...
                </p>
              </main>
            }
          >
            <Routes>
              <Route path="/" element={<DocumentListPage />} />
              <Route path="/doc/:id" element={<EditorPage />} />
            </Routes>
          </Suspense>
          <Toast />
          <UpdateNotification show={needRefresh} onUpdate={() => updateServiceWorker()} />
        </ToastProvider>
      </ThemeProvider>
    </DocumentProvider>
  );
}

export default App;
