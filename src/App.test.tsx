import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import App from '@/App';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

vi.mock('@/lib/db', () => ({
  documentRepository: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'test-doc-123',
        title: 'テスト',
        body: '本文',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]),
    getById: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

const localStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

describe('App', () => {
  it('/ でアプリが正常にレンダリングされること', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Assert
    expect(await screen.findByRole('main')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'InkFlow' })).toBeInTheDocument();
  });

  it('/doc/:id でエディタページがレンダリングされること', async () => {
    // Arrange & Act
    render(
      <MemoryRouter initialEntries={['/doc/test-doc-123']}>
        <App />
      </MemoryRouter>
    );

    // Assert — wait for document to load from mock repository
    expect(await screen.findByRole('button', { name: '一覧に戻る' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'タイトル' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '本文' })).toBeInTheDocument();
  });
});
