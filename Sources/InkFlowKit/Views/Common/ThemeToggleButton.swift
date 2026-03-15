import SwiftUI

public struct ThemeToggleButton: View {
    @Environment(ThemeManager.self) private var themeManager

    public init() {}

    public var body: some View {
        Button {
            themeManager.cycle()
        } label: {
            Image(systemName: themeManager.currentIcon)
                .font(.system(size: 18))
                .accessibilityLabel(accessibilityLabel)
        }
    }

    private var accessibilityLabel: String {
        switch themeManager.themeMode {
        case .light: return "ライトテーマ。タップでダークテーマに切替"
        case .dark: return "ダークテーマ。タップでシステムテーマに切替"
        case .system: return "システムテーマ。タップでライトテーマに切替"
        }
    }
}

#Preview {
    ThemeToggleButton()
        .environment(ThemeManager())
        .padding()
}
