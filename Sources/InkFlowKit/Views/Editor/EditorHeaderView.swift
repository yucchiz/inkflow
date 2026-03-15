import SwiftUI

public struct EditorHeaderView: View {
    let title: String
    let bodyText: String
    let isFocusMode: Bool
    let onBack: () -> Void
    let onCopy: () -> Void
    let onToggleFocusMode: () -> Void
    let onDelete: () -> Void

    @Environment(\.colorScheme) private var colorScheme

    public init(
        title: String,
        bodyText: String,
        isFocusMode: Bool,
        onBack: @escaping () -> Void,
        onCopy: @escaping () -> Void,
        onToggleFocusMode: @escaping () -> Void,
        onDelete: @escaping () -> Void
    ) {
        self.title = title
        self.bodyText = bodyText
        self.isFocusMode = isFocusMode
        self.onBack = onBack
        self.onCopy = onCopy
        self.onToggleFocusMode = onToggleFocusMode
        self.onDelete = onDelete
    }

    public var body: some View {
        HStack {
            Button {
                onBack()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18))
                    .foregroundStyle(Color.InkFlow.text(for: colorScheme))
            }
            .accessibilityLabel("戻る")

            Spacer()

            EditorMenuView(
                title: title,
                bodyText: bodyText,
                isFocusMode: isFocusMode,
                onCopy: onCopy,
                onToggleFocusMode: onToggleFocusMode,
                onDelete: onDelete
            )
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

#Preview {
    EditorHeaderView(
        title: "サンプルタイトル",
        bodyText: "本文テキスト",
        isFocusMode: false,
        onBack: {},
        onCopy: {},
        onToggleFocusMode: {},
        onDelete: {}
    )
}
