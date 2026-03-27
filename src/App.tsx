import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { RepositoryProvider } from './contexts/RepositoryContext'
import { IndexedDBRepository } from './data/IndexedDBRepository'
import { DocumentListPage } from './components/document-list/DocumentListPage'
import { EditorPage } from './components/editor/EditorPage'
import { ToastOverlay } from './components/common/Toast'
import './theme/tokens.css'
import './index.css'
import './App.css'

const repository = new IndexedDBRepository()

export default function App() {
  return (
    <BrowserRouter basename="/inkflow">
      <ThemeProvider>
        <ToastProvider>
          <RepositoryProvider repository={repository}>
            <div className="app-root">
              <Routes>
                <Route path="/" element={<DocumentListPage />} />
                <Route path="/edit/:id" element={<EditorPage />} />
              </Routes>
            </div>
            <ToastOverlay />
          </RepositoryProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
