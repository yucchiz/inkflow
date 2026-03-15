import { formatDate } from '@/lib/formatDate';

// NOTE: テスト環境のタイムゾーンは Asia/Tokyo (UTC+9) を前提とする。
// ISO文字列はUTCで記述し、JST変換後の日付で「今日」「昨日」を判定する。
// 「現在時刻」= 2026-03-14T06:00:00.000Z = JST 2026/3/14 15:00

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-03-14T06:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDate', () => {
  describe('今日の日付', () => {
    it('今日の日付をHH:MM形式（24時間表記）で返すこと', () => {
      // JST 2026/3/14 12:30
      const result = formatDate('2026-03-14T03:30:00.000Z');

      expect(result).toBe('12:30');
    });

    it('今日の0:00を「00:00」と返すこと（境界値）', () => {
      // JST 2026/3/14 00:00
      const result = formatDate('2026-03-13T15:00:00.000Z');

      expect(result).toBe('00:00');
    });
  });

  describe('昨日の日付', () => {
    it('昨日の日付を「昨日」と返すこと', () => {
      // JST 2026/3/13 10:00
      const result = formatDate('2026-03-13T01:00:00.000Z');

      expect(result).toBe('昨日');
    });

    it('昨日の23:59を「昨日」と返すこと（境界値）', () => {
      // JST 2026/3/13 23:59
      const result = formatDate('2026-03-13T14:59:00.000Z');

      expect(result).toBe('昨日');
    });
  });

  describe('今年の日付', () => {
    it('今年の別の日をM月D日形式で返すこと', () => {
      // JST 2026/3/1 00:00
      const result = formatDate('2026-02-28T15:00:00.000Z');

      expect(result).toBe('3月1日');
    });

    it('今年の1月1日を「1月1日」と返すこと', () => {
      // JST 2026/1/1 00:00
      const result = formatDate('2025-12-31T15:00:00.000Z');

      expect(result).toBe('1月1日');
    });
  });

  describe('去年以前の日付', () => {
    it('去年の日付をYYYY年M月D日形式で返すこと', () => {
      // JST 2025/3/1 09:00
      const result = formatDate('2025-03-01T00:00:00.000Z');

      expect(result).toBe('2025年3月1日');
    });

    it('2年前の日付をYYYY年M月D日形式で返すこと', () => {
      // JST 2024/12/25 09:00
      const result = formatDate('2024-12-25T00:00:00.000Z');

      expect(result).toBe('2024年12月25日');
    });
  });
});
