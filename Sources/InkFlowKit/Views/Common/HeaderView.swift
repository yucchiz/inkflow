import SwiftUI

public struct HeaderView: View {
    @Environment(\.colorScheme) private var colorScheme

    public init() {}

    public var body: some View {
        HStack {
            Text("InkFlow")
                .font(Typography.title(size: 20))
                .foregroundStyle(Color.InkFlow.text(for: colorScheme))
            Spacer()
            ThemeToggleButton()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

#Preview {
    HeaderView()
        .environment(ThemeManager())
}
