/**
 * Format a timestamp for display in InkFlow.
 *
 * Rules (matching the Swift implementation):
 * - Today: "HH:mm" (zero-padded 24-hour)
 * - Yesterday: "昨日"
 * - This year (not today/yesterday): "M月d日" (no zero-padding)
 * - Older (different year): "yyyy年M月d日"
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param now - Optional "current time" timestamp for deterministic testing
 */
export function inkFlowFormatted(timestamp: number, now?: number): string {
  const currentTime = now ?? Date.now()
  const date = new Date(timestamp)
  const nowDate = new Date(currentTime)

  // Compare calendar dates in local timezone
  const dateYear = date.getFullYear()
  const dateMonth = date.getMonth()
  const dateDay = date.getDate()

  const nowYear = nowDate.getFullYear()
  const nowMonth = nowDate.getMonth()
  const nowDay = nowDate.getDate()

  // Check if same calendar date (today)
  if (dateYear === nowYear && dateMonth === nowMonth && dateDay === nowDay) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Check if yesterday
  const yesterday = new Date(nowYear, nowMonth, nowDay - 1)
  if (
    dateYear === yesterday.getFullYear() &&
    dateMonth === yesterday.getMonth() &&
    dateDay === yesterday.getDate()
  ) {
    return '昨日'
  }

  // Same year
  if (dateYear === nowYear) {
    return `${dateMonth + 1}月${dateDay}日`
  }

  // Different year
  return `${dateYear}年${dateMonth + 1}月${dateDay}日`
}
