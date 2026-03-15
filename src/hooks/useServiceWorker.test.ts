import { renderHook, act } from '@testing-library/react';

const mockUpdateServiceWorker = vi.fn();
let mockNeedRefresh = false;
let mockSetNeedRefresh: (value: boolean) => void;

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [mockNeedRefresh, (v: boolean) => mockSetNeedRefresh(v)],
    updateServiceWorker: mockUpdateServiceWorker,
  }),
}));

import { useServiceWorker } from '@/hooks/useServiceWorker';

describe('useServiceWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNeedRefresh = false;
    mockSetNeedRefresh = vi.fn();
  });

  it('needRefresh の初期値が false であること', () => {
    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.needRefresh).toBe(false);
  });

  it('更新検知で needRefresh が true になること', () => {
    mockNeedRefresh = true;

    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.needRefresh).toBe(true);
  });

  it('updateServiceWorker が呼び出し可能であること', () => {
    const { result } = renderHook(() => useServiceWorker());

    act(() => {
      result.current.updateServiceWorker();
    });

    expect(mockUpdateServiceWorker).toHaveBeenCalled();
  });
});
