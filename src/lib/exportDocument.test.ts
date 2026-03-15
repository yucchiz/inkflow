import { copyToClipboard, downloadAsTxt } from '@/lib/exportDocument';

describe('copyToClipboard', () => {
  it('成功時に true を返すこと', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const result = await copyToClipboard('テスト本文');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('テスト本文');
    expect(result).toBe(true);
  });

  it('失敗時に false を返すこと', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('clipboard error')),
      },
    });

    const result = await copyToClipboard('テスト本文');

    expect(result).toBe(false);
  });
});

describe('downloadAsTxt', () => {
  let mockAnchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAnchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);

    createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('タイトルありの場合 {title}.txt というファイル名になること', () => {
    downloadAsTxt('日記', '今日は晴れ');

    expect(mockAnchor.download).toBe('日記.txt');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('タイトル空の場合 inkflow-{YYYY-MM-DD}.txt というファイル名になること', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T00:00:00.000Z'));

    downloadAsTxt('', '本文のみ');

    expect(mockAnchor.download).toBe('inkflow-2026-03-15.txt');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

    vi.useRealTimers();
  });

  it('タイトルありの場合、内容が title + \\n\\n + body 形式であること', async () => {
    downloadAsTxt('私の日記', 'とても良い一日でした');

    const blob: Blob = createObjectURLSpy.mock.calls[0][0];
    const text = await blob.text();
    expect(text).toBe('私の日記\n\nとても良い一日でした');
  });

  it('タイトル空の場合、内容が本文のみであること', async () => {
    downloadAsTxt('', '本文だけの内容');

    const blob: Blob = createObjectURLSpy.mock.calls[0][0];
    const text = await blob.text();
    expect(text).toBe('本文だけの内容');
  });
});
