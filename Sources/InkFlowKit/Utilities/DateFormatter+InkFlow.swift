import Foundation

extension Date {
    /// InkFlow の日時フォーマット
    /// - 今日: "HH:mm"（例: "14:30"）
    /// - 昨日: "昨日"
    /// - 今年: "M月d日"（例: "3月1日"）
    /// - 去年以前: "yyyy年M月d日"（例: "2025年3月1日"）
    public func inkFlowFormatted(now: Date = .now) -> String {
        let calendar = Calendar.current

        if calendar.isDate(self, inSameDayAs: now) {
            let formatter = DateFormatter()
            formatter.dateFormat = "HH:mm"
            formatter.locale = Locale(identifier: "ja_JP")
            return formatter.string(from: self)
        }

        if let yesterday = calendar.date(byAdding: .day, value: -1, to: now),
           calendar.isDate(self, inSameDayAs: yesterday) {
            return "昨日"
        }

        if calendar.component(.year, from: self) == calendar.component(.year, from: now) {
            let formatter = DateFormatter()
            formatter.dateFormat = "M月d日"
            formatter.locale = Locale(identifier: "ja_JP")
            return formatter.string(from: self)
        }

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy年M月d日"
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter.string(from: self)
    }
}
