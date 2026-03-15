import Testing
import Foundation
@testable import InkFlowKit

@Suite("DateFormatter+InkFlow")
struct DateFormatterTests {
    // 固定の「現在時刻」を使ってテスト
    private let now = DateFormatterTests.makeDate(2026, 3, 15, 14, 30)

    @Test("今日の日付が HH:mm 形式でフォーマットされること")
    func todayFormat() {
        let date = DateFormatterTests.makeDate(2026, 3, 15, 10, 5)
        #expect(date.inkFlowFormatted(now: now) == "10:05")
    }

    @Test("今日の深夜0時が HH:mm 形式でフォーマットされること")
    func todayMidnightFormat() {
        let date = DateFormatterTests.makeDate(2026, 3, 15, 0, 0)
        #expect(date.inkFlowFormatted(now: now) == "00:00")
    }

    @Test("昨日の日付が「昨日」と表示されること")
    func yesterdayFormat() {
        let date = DateFormatterTests.makeDate(2026, 3, 14, 20, 0)
        #expect(date.inkFlowFormatted(now: now) == "昨日")
    }

    @Test("昨日の深夜0時が「昨日」と表示されること")
    func yesterdayMidnightFormat() {
        let date = DateFormatterTests.makeDate(2026, 3, 14, 0, 0)
        #expect(date.inkFlowFormatted(now: now) == "昨日")
    }

    @Test("今年の日付が M月d日 形式でフォーマットされること")
    func thisYearFormat() {
        let date = DateFormatterTests.makeDate(2026, 1, 5, 12, 0)
        #expect(date.inkFlowFormatted(now: now) == "1月5日")
    }

    @Test("今年の別の月が M月d日 形式でフォーマットされること")
    func thisYearAnotherMonth() {
        let date = DateFormatterTests.makeDate(2026, 2, 28, 9, 30)
        #expect(date.inkFlowFormatted(now: now) == "2月28日")
    }

    @Test("去年の日付が yyyy年M月d日 形式でフォーマットされること")
    func lastYearFormat() {
        let date = DateFormatterTests.makeDate(2025, 12, 25, 9, 0)
        #expect(date.inkFlowFormatted(now: now) == "2025年12月25日")
    }

    @Test("さらに前の年の日付が yyyy年M月d日 形式でフォーマットされること")
    func olderYearFormat() {
        let date = DateFormatterTests.makeDate(2023, 6, 1, 15, 0)
        #expect(date.inkFlowFormatted(now: now) == "2023年6月1日")
    }

    @Test("深夜0時付近の境界ケース: 今日の23:59")
    func boundaryTodayLateNight() {
        let date = DateFormatterTests.makeDate(2026, 3, 15, 23, 59)
        #expect(date.inkFlowFormatted(now: now) == "23:59")
    }

    @Test("深夜0時付近の境界ケース: 一昨日は今年表示")
    func boundaryTwoDaysAgo() {
        let date = DateFormatterTests.makeDate(2026, 3, 13, 23, 59)
        #expect(date.inkFlowFormatted(now: now) == "3月13日")
    }

    @Test("年初の now で去年の日付をフォーマット")
    func yearBoundary() {
        let janFirst = DateFormatterTests.makeDate(2026, 1, 1, 0, 30)
        let lastYearEnd = DateFormatterTests.makeDate(2025, 12, 31, 23, 59)
        // 1月1日の前日 = 12月31日 → 昨日
        #expect(lastYearEnd.inkFlowFormatted(now: janFirst) == "昨日")
    }

    // MARK: - ヘルパー

    private static func makeDate(_ year: Int, _ month: Int, _ day: Int, _ hour: Int, _ minute: Int) -> Date {
        var components = DateComponents()
        components.year = year
        components.month = month
        components.day = day
        components.hour = hour
        components.minute = minute
        components.timeZone = TimeZone(identifier: "Asia/Tokyo")
        return Calendar.current.date(from: components)!
    }
}
