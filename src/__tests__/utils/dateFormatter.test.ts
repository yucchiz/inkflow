import { describe, it, expect } from 'vitest'
import { inkFlowFormatted } from '@/utils/dateFormatter'

/** Create a local-timezone timestamp for the given date/time components. */
function makeTimestamp(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
): number {
  return new Date(year, month - 1, day, hour, minute).getTime()
}

describe('inkFlowFormatted', () => {
  // Reference time: 2026-03-15 14:30 (local)
  const now = makeTimestamp(2026, 3, 15, 14, 30)

  it('今日の日付を HH:mm 形式で表示すること', () => {
    const timestamp = makeTimestamp(2026, 3, 15, 10, 5)
    expect(inkFlowFormatted(timestamp, now)).toBe('10:05')
  })

  it('今日の日付をゼロパディング付きで表示すること', () => {
    const timestamp = makeTimestamp(2026, 3, 15, 9, 5)
    expect(inkFlowFormatted(timestamp, now)).toBe('09:05')
  })

  it('昨日の日付を「昨日」と表示すること', () => {
    const timestamp = makeTimestamp(2026, 3, 14, 20, 0)
    expect(inkFlowFormatted(timestamp, now)).toBe('昨日')
  })

  it('今年の異なる日を M月d日 形式で表示すること', () => {
    const timestamp = makeTimestamp(2026, 1, 15)
    expect(inkFlowFormatted(timestamp, now)).toBe('1月15日')
  })

  it('今年の異なる月を M月d日 形式で表示すること', () => {
    const timestamp = makeTimestamp(2026, 3, 1)
    expect(inkFlowFormatted(timestamp, now)).toBe('3月1日')
  })

  it('前年の日付を yyyy年M月d日 形式で表示すること', () => {
    const timestamp = makeTimestamp(2025, 12, 25)
    expect(inkFlowFormatted(timestamp, now)).toBe('2025年12月25日')
  })

  it('古い年の日付を yyyy年M月d日 形式で表示すること', () => {
    const timestamp = makeTimestamp(2024, 6, 1)
    expect(inkFlowFormatted(timestamp, now)).toBe('2024年6月1日')
  })

  it('日付境界: 真夜中の前後で正しく判定すること', () => {
    // now = 2026-03-15 00:05 (just after midnight)
    const earlyNow = makeTimestamp(2026, 3, 15, 0, 5)

    // 2026-03-14 23:59 should be "昨日"
    const beforeMidnight = makeTimestamp(2026, 3, 14, 23, 59)
    expect(inkFlowFormatted(beforeMidnight, earlyNow)).toBe('昨日')

    // 2026-03-15 00:01 should be "00:01" (today)
    const afterMidnight = makeTimestamp(2026, 3, 15, 0, 1)
    expect(inkFlowFormatted(afterMidnight, earlyNow)).toBe('00:01')
  })

  it('年境界: 1月1日から見た前年12月31日を正しく表示すること', () => {
    const newYearNow = makeTimestamp(2026, 1, 1, 12, 0)
    const lastDayOfPrevYear = makeTimestamp(2025, 12, 31, 18, 0)

    // Dec 31 is yesterday when viewed from Jan 1
    expect(inkFlowFormatted(lastDayOfPrevYear, newYearNow)).toBe('昨日')
  })

  it('now パラメータなしでもエラーにならないこと', () => {
    const timestamp = makeTimestamp(2020, 1, 1)
    expect(() => inkFlowFormatted(timestamp)).not.toThrow()
  })
})
