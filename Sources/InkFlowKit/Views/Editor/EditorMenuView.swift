import SwiftUI

public struct EditorMenuView: View {
    let title: String
    let bodyText: String
    let isFocusMode: Bool
    let onCopy: () -> Void
    let onToggleFocusMode: () -> Void
    let onDelete: () -> Void

    @Environment(\.colorScheme) private var colorScheme

    public init(
        title: String,
        bodyText: String,
        isFocusMode: Bool,
        onCopy: @escaping () -> Void,
        onToggleFocusMode: @escaping () -> Void,
        onDelete: @escaping () -> Void
    ) {
        self.title = title
        self.bodyText = bodyText
        self.isFocusMode = isFocusMode
        self.onCopy = onCopy
        self.onToggleFocusMode = onToggleFocusMode
        self.onDelete = onDelete
    }

    public var body: some View {
        Menu {
            Button {
                onCopy()
            } label: {
                Label("コピー", systemImage: "doc.on.doc")
            }

            ShareLink(item: ExportHelper.exportText(title: title, body: bodyText)) {
                Label("共有", systemImage: "square.and.arrow.up")
            }

            Divider()

            ThemeToggleButton()

            Button {
                onToggleFocusMode()
            } label: {
                Label(
                    isFocusMode ? "集中モード解除" : "集中モード",
                    systemImage: isFocusMode
                        ? "arrow.down.right.and.arrow.up.left"
                        : "arrow.up.left.and.arrow.down.right"
                )
            }

            Divider()

            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("削除", systemImage: "trash")
            }
            #if os(macOS)
            .keyboardShortcut(.delete, modifiers: .command)
            #endif
        } label: {
            Image(systemName: "ellipsis.circle")
                .font(.system(size: 18))
                .foregroundStyle(Color.InkFlow.text(for: colorScheme))
        }
        .accessibilityLabel("メニュー")
    }
}

#Preview {
    EditorMenuView(
        title: "サンプルタイトル",
        bodyText: "これは本文のテキストです。",
        isFocusMode: false,
        onCopy: {},
        onToggleFocusMode: {},
        onDelete: {}
    )
    .environment(ThemeManager())
}
