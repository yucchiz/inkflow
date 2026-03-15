import SwiftUI

extension Color {
    public enum InkFlow {
        // MARK: - ライトテーマ

        public static let bgLight = Color(hex: "#E8EDF5")
        public static let bgSubLight = Color(hex: "#F0F3F9")
        public static let textLight = Color(hex: "#1A2340")
        public static let textSubLight = Color(hex: "#5C6785")
        public static let borderLight = Color(hex: "#C8D0E0")
        public static let accentLight = Color(hex: "#1E40AF")
        public static let accentHoverLight = Color(hex: "#1E3A8A")
        public static let dangerLight = Color(hex: "#B91C1C")
        public static let dangerBgLight = Color(hex: "#B91C1C")

        // MARK: - ダークテーマ

        public static let bgDark = Color(hex: "#0C1525")
        public static let bgSubDark = Color(hex: "#162038")
        public static let textDark = Color(hex: "#E2E8F4")
        public static let textSubDark = Color(hex: "#8A95B0")
        public static let borderDark = Color(hex: "#253050")
        public static let accentDark = Color(hex: "#2D6CD6")
        public static let accentHoverDark = Color(hex: "#3570D4")
        public static let dangerDark = Color(hex: "#F45252")
        public static let dangerBgDark = Color(hex: "#DC2626")

        // MARK: - 環境適応カラー（ColorScheme に応じて切り替え）

        public static func bg(for scheme: ColorScheme) -> Color {
            scheme == .dark ? bgDark : bgLight
        }

        public static func bgSub(for scheme: ColorScheme) -> Color {
            scheme == .dark ? bgSubDark : bgSubLight
        }

        public static func text(for scheme: ColorScheme) -> Color {
            scheme == .dark ? textDark : textLight
        }

        public static func textSub(for scheme: ColorScheme) -> Color {
            scheme == .dark ? textSubDark : textSubLight
        }

        public static func border(for scheme: ColorScheme) -> Color {
            scheme == .dark ? borderDark : borderLight
        }

        public static func accent(for scheme: ColorScheme) -> Color {
            scheme == .dark ? accentDark : accentLight
        }

        public static func accentHover(for scheme: ColorScheme) -> Color {
            scheme == .dark ? accentHoverDark : accentHoverLight
        }

        public static func danger(for scheme: ColorScheme) -> Color {
            scheme == .dark ? dangerDark : dangerLight
        }

        public static func dangerBg(for scheme: ColorScheme) -> Color {
            scheme == .dark ? dangerBgDark : dangerBgLight
        }
    }
}

// MARK: - Hex カラー初期化

extension Color {
    public init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: UInt64
        (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        self.init(
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255
        )
    }
}
