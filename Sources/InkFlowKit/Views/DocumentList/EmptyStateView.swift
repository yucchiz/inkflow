import SwiftUI

public struct EmptyStateView: View {
    @Environment(\.colorScheme) private var colorScheme

    public init() {}

    public var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "pencil")
                .font(.largeTitle)
                .foregroundStyle(Color.InkFlow.textSub(for: colorScheme))

            Text("まだドキュメントがありません")
                .font(Typography.ui())
                .foregroundStyle(Color.InkFlow.textSub(for: colorScheme))

            Text("+ボタンで書き始めましょう")
                .font(Typography.caption())
                .foregroundStyle(Color.InkFlow.textSub(for: colorScheme))
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("ドキュメントがありません。プラスボタンで書き始めましょう")
    }
}

// MARK: - Preview

#Preview {
    EmptyStateView()
}
