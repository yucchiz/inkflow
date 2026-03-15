import SwiftUI

public enum ThemeMode: String, CaseIterable, Sendable {
    case light
    case dark
    case system
}

@MainActor
@Observable
public final class ThemeManager {
    // @AppStorage は @Observable 内で直接使えないため、UserDefaults を直接操作
    public var themeMode: ThemeMode {
        didSet {
            UserDefaults.standard.set(themeMode.rawValue, forKey: "inkflow:theme")
        }
    }

    public var resolvedColorScheme: ColorScheme? {
        switch themeMode {
        case .light: return .light
        case .dark: return .dark
        case .system: return nil  // OS に追従
        }
    }

    /// 3式サイクル: light → dark → system → light
    public func cycle() {
        switch themeMode {
        case .light: themeMode = .dark
        case .dark: themeMode = .system
        case .system: themeMode = .light
        }
    }

    /// 現在のテーマに対応する SF Symbols アイコン名
    public var currentIcon: String {
        switch themeMode {
        case .light: return "sun.max"
        case .dark: return "moon"
        case .system: return "desktopcomputer"
        }
    }

    public init() {
        let stored = UserDefaults.standard.string(forKey: "inkflow:theme") ?? "system"
        self.themeMode = ThemeMode(rawValue: stored) ?? .system
    }
}
