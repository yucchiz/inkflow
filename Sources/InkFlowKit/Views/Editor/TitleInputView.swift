import SwiftUI

public struct TitleInputView: View {
    @Binding var title: String
    @Environment(\.colorScheme) private var colorScheme

    public init(title: Binding<String>) {
        self._title = title
    }

    public var body: some View {
        TextField("タイトル", text: $title)
            .font(Typography.title())
            .foregroundStyle(Color.InkFlow.text(for: colorScheme))
            .onChange(of: title) { _, newValue in
                if newValue.count > Constants.maxTitleLength {
                    title = String(newValue.prefix(Constants.maxTitleLength))
                }
            }
            .accessibilityLabel("タイトル")
            .accessibilityHint("ドキュメントのタイトルを入力。最大200文字")
    }
}

#Preview {
    @Previewable @State var title = "プレビュー用タイトル"
    TitleInputView(title: $title)
        .padding()
}
