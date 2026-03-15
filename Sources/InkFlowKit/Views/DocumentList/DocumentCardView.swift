import SwiftUI

public struct DocumentCardView: View {
    public let document: InkDocument
    @Environment(\.colorScheme) private var colorScheme

    public init(document: InkDocument) {
        self.document = document
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // タイトル（空なら「無題のドキュメント」）
            Text(document.title.isEmpty ? "無題のドキュメント" : document.title)
                .font(Typography.title())
                .foregroundStyle(Color.InkFlow.text(for: colorScheme))
                .lineLimit(1)

            // 本文プレビュー（先頭2行）
            if !document.body.isEmpty {
                Text(document.body)
                    .font(Typography.ui())
                    .foregroundStyle(Color.InkFlow.textSub(for: colorScheme))
                    .lineLimit(2)
            }

            // 更新日時
            Text(document.updatedAt.inkFlowFormatted())
                .font(Typography.caption())
                .foregroundStyle(Color.InkFlow.textSub(for: colorScheme))
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.InkFlow.bgSub(for: colorScheme))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .accessibilityElement(children: .combine)
        .accessibilityLabel(cardAccessibilityLabel)
    }

    private var cardAccessibilityLabel: String {
        let title = document.title.isEmpty ? "無題のドキュメント" : document.title
        let date = document.updatedAt.inkFlowFormatted()
        return "\(title)、\(date)"
    }
}

// MARK: - Preview

#Preview("通常のドキュメント") {
    DocumentCardView(
        document: InkDocument(
            title: "SwiftUI メモ",
            body: "Dynamic Type に対応するために TextStyle ベースのフォントを使用する。これにより設定アプリのテキストサイズ変更に自動追従する。",
            createdAt: .now,
            updatedAt: .now
        )
    )
    .padding()
}

#Preview("無題のドキュメント") {
    DocumentCardView(
        document: InkDocument(
            title: "",
            body: "",
            createdAt: .now,
            updatedAt: .now
        )
    )
    .padding()
}
