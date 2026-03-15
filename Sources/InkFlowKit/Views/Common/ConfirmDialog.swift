import SwiftUI

public struct ConfirmDialogModifier: ViewModifier {
    @Binding var isPresented: Bool
    let title: String
    let message: String
    let confirmLabel: String
    let confirmRole: ButtonRole?
    let onConfirm: () -> Void

    public func body(content: Content) -> some View {
        content
            .confirmationDialog(title, isPresented: $isPresented, titleVisibility: .visible) {
                Button(confirmLabel, role: confirmRole) {
                    onConfirm()
                }
                Button("キャンセル", role: .cancel) {}
            } message: {
                Text(message)
            }
    }
}

extension View {
    public func confirmDialog(
        isPresented: Binding<Bool>,
        title: String,
        message: String,
        confirmLabel: String = "削除",
        confirmRole: ButtonRole? = .destructive,
        onConfirm: @escaping () -> Void
    ) -> some View {
        modifier(ConfirmDialogModifier(
            isPresented: isPresented,
            title: title,
            message: message,
            confirmLabel: confirmLabel,
            confirmRole: confirmRole,
            onConfirm: onConfirm
        ))
    }
}

#Preview {
    @Previewable @State var showDialog = true

    Text("確認ダイアログのプレビュー")
        .confirmDialog(
            isPresented: $showDialog,
            title: "ドキュメントを削除",
            message: "この操作は取り消せません。本当に削除しますか？",
            onConfirm: {}
        )
}
