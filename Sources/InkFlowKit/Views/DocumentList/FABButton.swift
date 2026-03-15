import SwiftUI

public struct FABButton: View {
    let action: () -> Void
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ScaledMetric(relativeTo: .title2) private var iconSize: CGFloat = 24
    @State private var isPressed = false

    /// アイコンが Dynamic Type で際限なく大きくならないよう上限を設ける
    private var clampedIconSize: CGFloat {
        min(iconSize, 36)
    }

    public init(action: @escaping () -> Void) {
        self.action = action
    }

    public var body: some View {
        Button {
            if !reduceMotion {
                withAnimation(.easeInOut(duration: 0.15)) {
                    isPressed = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    isPressed = false
                }
            }
            action()
        } label: {
            Image(systemName: "plus")
                .font(.system(size: clampedIconSize, weight: .medium))
                .foregroundStyle(Color.InkFlow.bg(for: colorScheme))
                .frame(width: 56, height: 56)
                .background(Color.InkFlow.text(for: colorScheme))
                .clipShape(Circle())
                .shadow(
                    color: Color.InkFlow.text(for: colorScheme).opacity(0.15),
                    radius: 4,
                    y: 2
                )
        }
        .scaleEffect(isPressed ? 0.92 : 1.0)
        .accessibilityLabel("新規ドキュメントを作成")
        .accessibilityHint("タップして新しいドキュメントを作成します")
    }
}

// MARK: - Preview

#Preview {
    ZStack {
        Color.gray.opacity(0.1)
            .ignoresSafeArea()

        VStack {
            Spacer()
            HStack {
                Spacer()
                FABButton { }
                    .padding(24)
            }
        }
    }
}
