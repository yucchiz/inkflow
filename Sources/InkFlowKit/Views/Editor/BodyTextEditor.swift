import SwiftUI

public struct BodyTextEditor: View {
    @Binding var text: String
    @FocusState.Binding var isFocused: Bool
    @Environment(\.colorScheme) private var colorScheme

    public init(text: Binding<String>, isFocused: FocusState<Bool>.Binding) {
        self._text = text
        self._isFocused = isFocused
    }

    public var body: some View {
        TextEditor(text: $text)
            .font(Typography.body())
            .foregroundStyle(Color.InkFlow.text(for: colorScheme))
            .scrollContentBackground(.hidden)
            .focused($isFocused)
            .accessibilityLabel("本文")
            .accessibilityHint("ドキュメントの本文を入力")
    }
}

#Preview {
    @Previewable @State var text = "これはプレビュー用の本文テキストです。"
    @Previewable @FocusState var isFocused: Bool
    BodyTextEditor(text: $text, isFocused: $isFocused)
        .padding()
}
