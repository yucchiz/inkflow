import SwiftUI

public enum Typography {
    /// 本文 — Noto Serif JP バンドル予定、現在は serif デザインのシステムフォント
    public static func body() -> Font {
        .system(.body, design: .serif)
    }

    /// タイトル — 太字のシステムフォント
    public static func title() -> Font {
        .system(.title2, design: .default, weight: .bold)
    }

    /// タイトル — 指定サイズの太字フォント
    public static func title(size: CGFloat) -> Font {
        .system(size: size, weight: .bold, design: .default)
    }

    /// UI要素 — 標準のシステムフォント
    public static func ui() -> Font {
        .system(.body)
    }

    /// キャプション — 小さめのシステムフォント
    public static func caption() -> Font {
        .system(.caption)
    }
}
